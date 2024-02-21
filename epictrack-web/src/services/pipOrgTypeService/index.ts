import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class PIPOrgTypeService {
  async getAll() {
    return await http.GetRequest(Endpoints.PIPOrgTypes.GET_ALL);
  }
}

export default new PIPOrgTypeService();
