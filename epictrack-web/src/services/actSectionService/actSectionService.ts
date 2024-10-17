import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

class ActSectionService {
  async getActSectionsByEaAct(eaActId?: number) {
    return await http.GetRequest(
      Endpoints.ActSections.ACT_SECTIONS + `?ea_act_id=${eaActId}`
    );
  }
}

export default new ActSectionService();
