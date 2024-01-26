import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

class IndigenousNationsConsultationLevels {
  async getAll(is_active = true) {
    return await http.GetRequest(
      Endpoints.IndigenousNationsConsultationLevels.GET_ALL,
      { is_active }
    );
  }
}
export default new IndigenousNationsConsultationLevels();
