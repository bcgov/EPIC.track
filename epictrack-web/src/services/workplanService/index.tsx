import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { WorkPlan } from "../../models/workplan";

class WorkPlanService {
  async getAll(page: number) {
    return await http.GetRequest<WorkPlan[]>(Endpoints.Workplan.GET_ALL);
  }
}
export default new WorkPlanService();
