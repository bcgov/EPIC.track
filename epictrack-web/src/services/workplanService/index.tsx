import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { WorkPlan } from "../../models/workplan";

class WorkPlanService {
  async getAll(page: number, size: number) {
    console.log("PAGE", page);
    return await http.GetRequest<WorkPlan[]>(Endpoints.Workplan.GET_ALL, {
      page: page,
      size: size,
    });
  }
}
export default new WorkPlanService();
