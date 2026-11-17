import { trackClient } from "apiManager/clients";
import { WorkType } from "models/workType";
import { TrackWorkTypeDto } from "./dto";
import { toWorkType } from "./mapper";

/** A plain object so Cypress can stub its methods. */
export const workTypesApi = {
  list: async (): Promise<WorkType[]> =>
    (await trackClient.get<TrackWorkTypeDto[]>("work-types")).map(toWorkType),

  /** Work types of the project's other works. */
  listInProject: async (
    projectId: number,
    excludeWorkId: number,
  ): Promise<WorkType[]> =>
    (
      await trackClient.get<TrackWorkTypeDto[]>(
        `projects/${projectId}/work-types`,
        { params: { work_id: excludeWorkId } },
      )
    ).map(toWorkType),
};
