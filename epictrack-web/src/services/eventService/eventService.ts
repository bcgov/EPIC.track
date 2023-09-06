import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { MilestoneEvent } from "../../models/events";

class EventService {
  async create(taskEvent: MilestoneEvent, workId: number, phaseId: number) {
    return await http.PostRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/works/:work_id/phases/:phase_id`
        .replace(":work_id", workId.toString())
        .replace(":phase_id", phaseId.toString()),
      JSON.stringify(taskEvent)
    );
  }
  async GetMilestoneEvents(workId: number, phaseId: number) {
    return await http.GetRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/works/:work_id/phases/:phase_id`
        .replace(":work_id", workId.toString())
        .replace(":phase_id", phaseId.toString())
    );
  }

  async getById(eventId: number) {
    return await http.GetRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/${eventId}`
    );
  }

  async update(event: MilestoneEvent, eventId: number) {
    return await http.PutRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/${eventId}`,
      JSON.stringify(event)
    );
  }
}
export default new EventService();
