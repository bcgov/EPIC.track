import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { Status } from "../../models/status";

class StatusService {
  async create(workId: number, data: any) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.PostRequest(query, JSON.stringify(data));
  }
  async update(workId: number, statusId: number, data: any) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}/${statusId.toString()}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }
  async getAll(workId: number) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest<Status[]>(query);
  }
  async approve(workId: number, statusId: number) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}/${statusId}/approve`;
    return await http.PatchRequest(query);
  }
}

export default new StatusService();
