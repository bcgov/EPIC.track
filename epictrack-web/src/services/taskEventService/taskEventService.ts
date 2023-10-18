import { TaskEvent } from "../../models/taskEvent";
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

  async getAll(workPhaseId: number) {
    return await http.GetRequest(
      `${Endpoints.TaskEvents.EVENTS}?work_phase_id=${workPhaseId}`
    );
  }

  async getById(eventId: number) {
    return await http.GetRequest(`${Endpoints.TaskEvents.EVENTS}/${eventId}`);
  }

  async importTasksFromTemplate(payload: any, templateId: number) {
    return await http.PostRequest(
      `${Endpoints.TaskEvents.TASKS}/templates/${templateId}/events`,
      JSON.stringify(payload)
    );
  }

  async patchTasks(payload: any) {
    return await http.PatchRequest(
      Endpoints.TaskEvents.EVENTS,
      JSON.stringify(payload)
    );
  }

  async deleteTasks(params: any) {
    return await http.DeleteRequest(Endpoints.TaskEvents.EVENTS, params);
  }
}

export default new TaskEventService();
