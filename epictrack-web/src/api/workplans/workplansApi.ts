import { trackClient } from "apiManager/clients";
import { WorkPlan, WorkPlanSearchOptions } from "models/workplan";
import { TrackWorkplanPageDto } from "./dto";
import { toWorkPlan } from "./mapper";

export interface WorkPlanPageQuery {
  page: number;
  size: number;
  sortOrder: string;
  sortKey: string;
  search: WorkPlanSearchOptions;
}

/** A plain object so Cypress can stub its methods. */
export const workplansApi = {
  /** The My Workplans dashboard. Filter arrays go out as `teams[]=1&teams[]=2`. */
  list: async ({
    page,
    size,
    sortOrder,
    sortKey,
    search,
  }: WorkPlanPageQuery): Promise<{ items: WorkPlan[]; total: number }> => {
    const result = await trackClient.get<TrackWorkplanPageDto>(
      "works/dashboard",
      {
        params: {
          page,
          size,
          sort_order: sortOrder,
          sort_key: sortKey,
          ...search,
        },
      },
    );
    return { items: result.items.map(toWorkPlan), total: result.total };
  },
};
