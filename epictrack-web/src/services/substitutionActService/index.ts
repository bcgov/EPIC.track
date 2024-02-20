import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class SubstitutionActService {
  async getAll() {
    return await http.GetRequest(Endpoints.SubstitutionActs.GET_ALL);
  }
}

export default new SubstitutionActService();
