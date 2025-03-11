import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class ElevatedRoleService {
  async getAll() {
    return await http.GetRequest(Endpoints.ElevatedRoles.GET_ALL);
  }
}

export default new ElevatedRoleService();
