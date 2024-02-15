import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class FederalInvolvementService {
  async getAll() {
    return await http.GetRequest(Endpoints.FederalInvolvement.GET_ALL);
  }
}

export default new FederalInvolvementService();
