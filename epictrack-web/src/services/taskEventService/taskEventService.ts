import { TaskEvent } from "../../models/task_event";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class TaskEventService {
  async create(taskEvent: TaskEvent) {
    return await http.PostRequest(
      Endpoints.TaskEvents.EVENTS,
      JSON.stringify(taskEvent)
    );
  }
  async update(taskEvent: TaskEvent, eventId: number) {
    return await http.PutRequest(
      `${Endpoints.TaskEvents.EVENTS}/${eventId}`,
      JSON.stringify(taskEvent)
    );
  }

  async getAllByWorkNdPhase(workId: number, phaseId: number) {
    return await http.GetRequest(
      `${Endpoints.TaskEvents.EVENTS}?work_id=${workId}&phase_id=${phaseId}`
    );
  }

  async getById(eventId: number) {
    return await http.GetRequest(`${Endpoints.TaskEvents.EVENTS}/${eventId}`);
  }
}

export default new TaskEventService();
