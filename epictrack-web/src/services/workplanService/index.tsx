import http from "../../apiManager/http-request-handler";
import { WorkPlanSearchOptions } from "../../components/myWorkplans/MyWorkPlanContext";
import Endpoints from "../../constants/api-endpoint";
import { WorkPlan } from "../../models/workplan";

class WorkPlanService {
  async getAll(
    page: number,
    size: number,
    searchOptions: WorkPlanSearchOptions
  ) {
    return await http.GetRequest<{ items: WorkPlan[]; total: number }>(
      Endpoints.Workplan.GET_ALL,
      {
        page: page,
        size: size,
        ...searchOptions,
      }
    );
  }
}
export default new WorkPlanService();
