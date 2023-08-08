import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import Endpoints from "../../constants/api-endpoint";

class EventService {
  async GetMilestoneEvents(workId: number, phaseId: number) {
    return await http.GetRequest(
      AppConfig.apiUrl +
        Endpoints.Events.MILESTONE_EVENTS +
        `?work_id=${workId}&phase_id=${phaseId}`
    );
  }
}
export default new EventService();
