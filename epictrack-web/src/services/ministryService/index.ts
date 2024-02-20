import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class MinistryService {
  async getAll() {
    return await http.GetRequest(Endpoints.Ministry.GET_ALL);
  }
}

export default new MinistryService();
