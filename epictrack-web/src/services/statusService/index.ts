import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { Status } from "../../models/status";

class StatusService {
  async create(status: Status) {
    // return await http.PostRequest<TaskEvent>(
    //   Endpoints.TaskEvents.EVENTS,
    //   JSON.stringify(taskEvent)
    // );
  }
  async update(status: Status, id: string) {
    // return await http.PutRequest<TaskEvent>(
    //   `${Endpoints.TaskEvents.EVENTS}/${eventId}`,
    //   JSON.stringify(taskEvent)
    // );
  }
}

export default new StatusService();
