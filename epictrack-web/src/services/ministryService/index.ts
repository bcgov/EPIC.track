import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class MinistryService {
  async getAll(return_type?: string) {
    return await http.GetRequest(Endpoints.Ministry.MINISTRY, { return_type });
  }
  async create(data: any) {
    return await http.PostRequest(
      Endpoints.Ministry.MINISTRY,
      JSON.stringify(data),
    );
  }
  async update(data: any, id: number) {
    return await http.PutRequest(
      Endpoints.Ministry.MINISTRY + `/${id}`,
      JSON.stringify(data),
    );
  }
}

export const ministryService = new MinistryService();
