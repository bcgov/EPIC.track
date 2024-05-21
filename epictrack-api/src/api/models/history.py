"""Versioned mixin class and other utilities."""

import datetime

from psycopg2.extras import DateTimeTZRange
from sqlalchemy import Column, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, event, func, inspect, util
from sqlalchemy.dialects.postgresql import TSTZRANGE
from sqlalchemy.orm import attributes, object_mapper
from sqlalchemy.orm.exc import UnmappedColumnError


# pylint:disable=invalid-name,unused-argument,too-many-locals,too-few-public-methods,protected-access
# pylint:disable=use-dict-literal,too-many-branches,too-many-statements

def col_references_table(col, table):
    """Checks if any foreign keys reference the given table"""
    for fk in col.foreign_keys:
        if fk.references(table):
            return True
    return False


def _is_versioning_col(col):
    return "version_meta" in col.info


def _history_mapper(local_mapper):
    cls = local_mapper.class_

    if cls.__dict__.get("_history_mapper_configured", False):
        return

    cls._history_mapper_configured = True

    super_mapper = local_mapper.inherits
    polymorphic_on = None
    super_fks = []
    properties = util.OrderedDict()

    if super_mapper:
        super_history_mapper = super_mapper.class_.__history_mapper__
    else:
        super_history_mapper = None

    if not super_mapper or local_mapper.local_table is not super_mapper.local_table:
        version_meta = {"version_meta": True}  # add column.info to identify
        # columns specific to versioning

        history_table = local_mapper.local_table.to_metadata(
            local_mapper.local_table.metadata,
            name=local_mapper.local_table.name + "_history",
        )

        for orig_c, history_c in zip(local_mapper.local_table.c, history_table.c):
            orig_c.info["history_copy"] = history_c
            history_c.unique = False
            history_c.default = history_c.server_default = None
            history_c.autoincrement = False

            if super_mapper and col_references_table(orig_c, super_mapper.local_table):
                assert super_history_mapper is not None
                super_fks.append(
                    (
                        history_c.key,
                        list(super_history_mapper.local_table.primary_key)[0],
                    )
                )
            if orig_c is local_mapper.polymorphic_on:
                polymorphic_on = history_c

            orig_prop = local_mapper.get_property_by_column(orig_c)
            # carry over column re-mappings
            if len(orig_prop.columns) > 1 or orig_prop.columns[0].key != orig_prop.key:
                properties[orig_prop.key] = tuple(
                    col.info["history_copy"] for col in orig_prop.columns
                )

        for const in list(history_table.constraints):
            if not isinstance(const, (PrimaryKeyConstraint, ForeignKeyConstraint)):
                history_table.constraints.discard(const)

        pk_column = Column(
            "pk",
            Integer,
            primary_key=True,
            autoincrement=True,
            info=version_meta,
        )
        pk_column._creation_order = 1
        history_table.append_column(pk_column)

        # "during" column stores the UTC timestamp range of when the
        # history row was active.
        history_table.append_column(
            Column(
                "during",
                TSTZRANGE,
                info=version_meta,
            )
        )

        if super_fks:
            history_table.append_constraint(ForeignKeyConstraint(*zip(*super_fks)))

    else:
        history_table = None
        super_history_table = super_mapper.local_table.metadata.tables[
            super_mapper.local_table.name + "_history"
        ]

        # single table inheritance.  take any additional columns that may have
        # been added and add them to the history table.
        for column in local_mapper.local_table.c:
            if column.key not in super_history_table.c:
                col = Column(column.name, column.type, nullable=column.nullable)
                super_history_table.append_column(col)

    if not super_mapper:
        if cls.use_mapper_versioning:
            local_mapper.version_id_col = local_mapper.local_table.c.version

    # set the "active_history" flag
    # on on column-mapped attributes so that the old version
    # of the info is always loaded (currently sets it on all attributes)
    for prop in local_mapper.iterate_properties:
        prop.active_history = True

    super_mapper = local_mapper.inherits

    if super_history_mapper:
        bases = (super_history_mapper.class_,)

        if history_table is not None:
            properties["during"] = (history_table.c.during,) + tuple(
                super_history_mapper.attrs.during.columns
            )

    else:
        bases = local_mapper.base_mapper.class_.__bases__

    versioned_cls = type(
        f"{cls.__name__}History",
        bases,
        {
            "_history_mapper_configured": True,
            "__table__": history_table,
            "__mapper_args__": dict(
                inherits=super_history_mapper,
                polymorphic_identity=local_mapper.polymorphic_identity,
                polymorphic_on=polymorphic_on,
                properties=properties,
            ),
        },
    )

    cls.__history_mapper__ = versioned_cls.__mapper__


class Versioned:
    """Creates {table_name}_history table to track changes to original table"""

    use_mapper_versioning = False
    """if True, also assign the version column to be tracked by the mapper"""

    __table_args__ = {"sqlite_autoincrement": True}
    """Use sqlite_autoincrement, to ensure unique integer values
    are used for new rows even for rows that have been deleted."""

    def __init_subclass__(cls) -> None:
        """Initialize the mapper"""
        insp = inspect(cls, raiseerr=False)

        if insp is not None:
            _history_mapper(insp)
        else:

            @event.listens_for(cls, "after_mapper_constructed")
            def _mapper_constructed(mapper, class_):
                _history_mapper(mapper)

        super().__init_subclass__()


def versioned_objects(iter_):
    """Returns the objects marked for history"""
    for obj in iter_:
        if hasattr(obj, "__history_mapper__"):
            yield obj


def create_version(obj, session, new=False, deleted=False):
    """Creates a new entry in the history table"""
    obj_mapper = object_mapper(obj)
    history_mapper = obj.__history_mapper__
    history_cls = history_mapper.class_

    obj_state = attributes.instance_state(obj)

    attr = {}

    # Get the names of fields that are being updated
    updated_fields = set()

    # Get the names of fields that should be excluded from version tracking
    exclude_from_tracking = getattr(obj.__class__, '__exclude_from_tracking_history__', set())

    # Get the names of fields that are being updated
    updated_fields = set()

    # Check which attributes of the object have been modified
    for modified_attrs in obj_state.attrs:
        if modified_attrs.history.has_changes():
            updated_fields.add(modified_attrs.key)

    # Print the updated fields

    # Check if all updated fields are excluded from tracking
    if updated_fields and not updated_fields - exclude_from_tracking:
        print("All updated fields are excluded from tracking. Skipping version creation.")
        return

    for om, hm in zip(obj_mapper.iterate_to_root(), history_mapper.iterate_to_root()):
        if hm.single:
            continue

        # Accessing __exclude_from_tracking_history__ attribute of the class
        exclude_from_tracking = getattr(obj.__class__, '__exclude_from_tracking_history__', set())

        for hist_col in hm.local_table.c:
            if _is_versioning_col(hist_col):
                continue

            obj_col = om.local_table.c[hist_col.key]
            # Check if the field is excluded from versioning
            if obj_col.key in exclude_from_tracking:
                continue

            # get the value of the
            # attribute based on the MapperProperty related to the
            # mapped column.  this will allow usage of MapperProperties
            # that have a different keyname than that of the mapped column.
            try:
                prop = obj_mapper.get_property_by_column(obj_col)
            except UnmappedColumnError:
                # in the case of single table inheritance, there may be
                # columns on the mapped table intended for the subclass only.
                # the "unmapped" status of the subclass column on the
                # base class is a feature of the declarative module.
                continue

            # expired object attributes and also deferred cols might not
            # be in the dict.  force it to load no matter what by
            # using getattr().
            if prop.key not in obj_state.dict:
                getattr(obj, prop.key)
            attr[prop.key] = getattr(obj, prop.key)

    hist = history_cls()
    for key, value in attr.items():
        setattr(hist, key, value)

    if not new:
        prev_history = history_cls.query.filter(
            history_cls.id == obj.id, func.upper(history_cls.during).is_(None)
        )
        print(prev_history.statement.compile(compile_kwargs={"literal_binds": True}))
        prev = prev_history.first()
        if prev:
            new_range = DateTimeTZRange(prev.during.lower, datetime.datetime.utcnow(), "[)")
            history_cls.query.filter(history_cls.pk == prev.pk).update(
                {"during": new_range}
            )

    new_range = DateTimeTZRange(datetime.datetime.utcnow(), None, "[)")
    setattr(hist, "during", new_range)
    session.add(hist)
    # obj.version += 1


def versioned_session(session):
    """Creates entries in history tables"""
    @event.listens_for(session, "after_flush")
    def after_flush(session, *args, **kwargs):
        for obj in versioned_objects(session.new):
            create_version(obj, session, new=True)
        for obj in versioned_objects(session.dirty):
            create_version(obj, session)
        for obj in versioned_objects(session.deleted):
            create_version(obj, session, deleted=True)
