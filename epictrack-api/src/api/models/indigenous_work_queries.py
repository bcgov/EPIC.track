from sqlalchemy.orm import joinedload

from api.models import db, IndigenousWork, Work


def find_all_by_project_id(project_id: int):
    query = (db.session.query(IndigenousWork)
             .join(Work, IndigenousWork.work_id == Work.id)
             .filter(Work.project_id == project_id)
             .options(joinedload(IndigenousWork.work))
             .distinct(Work.project_id, IndigenousWork.indigenous_nation_id)
             )
    return query.all()
