import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class PositionService {
  async getAll() {
    return await http.GetRequest(Endpoints.Position.GET_ALL);
  }
}

export default new PositionService();
