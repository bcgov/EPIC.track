import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class TypeService {
  async getAll() {
    return await http.GetRequest(Endpoints.Type.GET_ALL);
  }
}

export default new TypeService();
