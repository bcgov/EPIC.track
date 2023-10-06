import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class ConfigurationService {
  async getAll(work_phase_id: number, mandatory: any = undefined) {
    let url = `${Endpoints.Configurations.CONFIGURATIONS}/?work_phase_id=${work_phase_id}`;
    if (mandatory !== undefined) {
      url += `&mandatory=${mandatory}`;
    }
    return await http.GetRequest(url);
  }
}

export default new ConfigurationService();
