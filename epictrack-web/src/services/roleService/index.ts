import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class RoleService {
  async getAll() {
    return await http.GetRequest(Endpoints.Roles.GET_ALL);
  }
}

export default new RoleService();
