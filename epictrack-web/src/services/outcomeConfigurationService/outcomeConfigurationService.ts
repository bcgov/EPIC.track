import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

class OutcomeConfigurationService {
  async getOutcomeConfigurations(configurationId: number) {
    return await http.GetRequest(
      `${Endpoints.OutcomeConfigurations.CONFIGURATIONS}/?configuration_id=${configurationId}`
    );
  }
}
export default new OutcomeConfigurationService();
