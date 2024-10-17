import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { MilestoneEvent, MilestoneEventDateCheck } from "../../models/event";

class EventService {
  async create(
    milestoneEvent: MilestoneEvent | undefined,
    workPhaseId: number,
    pushEvents: boolean
  ) {
    return await http.PostRequest<MilestoneEvent>(
      `${Endpoints.Events.MILESTONE_EVENTS}/workphases/:work_phase_id/events?push_events=${pushEvents}`.replace(
        ":work_phase_id",
        workPhaseId.toString()
      ),
      JSON.stringify(milestoneEvent)
    );
  }
  async getMilestoneEvents(workPhaseId: number) {
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

  async update(
    event: MilestoneEvent | undefined,
    eventId: number,
    pushEvents: boolean
  ) {
    return await http.PutRequest<MilestoneEvent>(
      `${Endpoints.Events.MILESTONE_EVENTS}/events/${eventId}?push_events=${pushEvents}`,
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

  async check_event_for_date_push(
    milestoneEvent: MilestoneEvent | undefined,
    event_id: number | undefined
  ) {
    return await http.PostRequest<MilestoneEventDateCheck>(
      `${Endpoints.Events.MILESTONE_EVENTS}/check-events${
        event_id ? "?event_id=" + event_id : ""
      }`,
      JSON.stringify(milestoneEvent)
    );
  }
}
export default new EventService();
