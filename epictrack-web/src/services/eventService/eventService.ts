import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { MilestoneEvent } from "../../models/events";

class EventService {
  async create(
    milestoneEvent: MilestoneEvent | undefined,
    workPhaseId: number
  ) {
    return await http.PostRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/workphases/:work_phase_id/events`.replace(
        ":work_phase_id",
        workPhaseId.toString()
      ),
      JSON.stringify(milestoneEvent)
    );
  }
  async GetMilestoneEvents(workPhaseId: number) {
    return await http.GetRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/workphases/:work_phase_id/events`.replace(
        ":work_phase_id",
        workPhaseId.toString()
      )
    );
  }

  async getById(eventId: number) {
    return await http.GetRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/events/${eventId}`
    );
  }

  async update(event: MilestoneEvent | undefined, eventId: number) {
    return await http.PutRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/events/${eventId}`,
      JSON.stringify(event)
    );
  }

  async deleteMilestones(params: any) {
    return await http.DeleteRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/events`,
      params
    );
  }

  async deleteMilestone(milestoneId: any) {
    return await http.DeleteRequest(
      `${Endpoints.Events.MILESTONE_EVENTS}/events/${milestoneId}`
    );
  }
}
export default new EventService();
