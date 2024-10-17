import { TaskEvent } from "../../models/taskEvent";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

export type TaskEventMutationRequest = {
  name: string;
  start_date: string;
  number_of_days: number;
  assignee_ids: string[];
  responsibility_ids: string[];
  status: string;
  work_phase_id: number;
  notes: string;
};

class TaskEventService {
  async create(taskEvent: TaskEventMutationRequest) {
    return await http.PostRequest<TaskEvent>(
      Endpoints.TaskEvents.EVENTS,
      JSON.stringify(taskEvent)
    );
  }
  async update(taskEvent: TaskEventMutationRequest, eventId: number) {
    return await http.PutRequest<TaskEvent>(
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

  async getMyTasks(staffId: number) {
    return await http.GetRequest(
      `${Endpoints.TaskEvents.MY_TASKS.replace(
        ":staff_id",
        staffId.toString()
      )}`
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

  importTasks = async (work_phase_id: number, data: any) => {
    const url = Endpoints.TaskEvents.IMPORT_TASKS.replace(
      ":work_phase_id",
      work_phase_id.toString()
    );
    return await http.MultipartFormPostRequest(url, data);
  };
}

export default new TaskEventService();
