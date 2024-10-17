import { EventTemplateVisibility } from "models/event";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";

class ConfigurationService {
  async getAll(
    work_phase_id: number,
    visiblity_modes: EventTemplateVisibility[]
  ) {
    const url = `${Endpoints.Configurations.CONFIGURATIONS}/?work_phase_id=${work_phase_id}&visibility_modes=${visiblity_modes}&configurable=true`;
    return await http.GetRequest(url);
  }
}

export default new ConfigurationService();
