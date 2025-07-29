import { StatusSearchOptions } from "components/myStatuses/MyStatusContext";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { Status, StatusDashboardItem } from "../../models/status";

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

  async getAllbyWorkId(workId: number) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest<Status[]>(query);
  }

  async getAll(
    page: number,
    size: number,
    sort_order: string,
    searchOptions: StatusSearchOptions
  ) {
    return await http.GetRequest<{
      items: StatusDashboardItem[];
      total: number;
    }>(Endpoints.WorkStatuses.GET_ALL, {
      page: page,
      size: size,
      sort_key: "posted_date",
      sort_order: sort_order,
      ...searchOptions,
    });
  }

  async approve(workId: number, statusId: number) {
    const query = `${Endpoints.WorkStatuses.WORK_STATUSES.replace(
      ":work_id",
      workId.toString()
    )}/${statusId}/approve`;
    return await http.PatchRequest(query);
  }
}

export const statusService = new StatusService();
