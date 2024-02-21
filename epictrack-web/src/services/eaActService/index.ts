import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class EAActService {
  async getAll() {
    return await http.GetRequest(Endpoints.EAAct.GET_ALL);
  }
}

export default new EAActService();
