import React, { useEffect } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import {
  getSelectFilterOptions,
  rowsPerPageOptions,
} from "components/shared/MasterTrackTable/utils";
import { ETGridTitle } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import { ActiveChip, InactiveChip } from "components/shared/chip/ETChip";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksQuery } from "services/rtkQuery/insights";

const WorkList = () => {
  const [phases, setPhases] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [ministries, setMinistries] = React.useState<string[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, error, isLoading } = useGetWorksQuery();

  const works = data || [];

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: works.length,
    }));
  }, [works]);

  const codeTypes: { [x: string]: any } = {
    work_type: setWorkTypes,
    project: setProjects,
    ministry: setMinistries,
    current_work_phase: setPhases,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = "name";
      if (key == "ministry") {
        accessor = "abbreviation";
      }
      const codes = works
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => (w[key] ? w[key][accessor] : null))
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [works]);

  const statuses = getSelectFilterOptions(
    works,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  useEffect(() => {
    if (error) {
      showNotification("Error fetching works", { type: "error" });
    }
  }, [error]);

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: projects,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > projects.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_type.name",
        header: "Work type",
        filterVariant: "multi-select",
        filterSelectOptions: workTypes,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > workTypes.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "current_work_phase.name",
        header: "Current Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > phases.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 80,
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statuses.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id);

          return filterValue.includes(value);
        },
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && (
              <ActiveChip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [projects, phases, workTypes]
  );
  return (
    <MasterTrackTable
      columns={columns}
      data={works}
      initialState={{
        sorting: [
          {
            id: "title",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
      }}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(works.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
