import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

type ConsultationLevel = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};
class IndigenousNationsConsultationLevels {
  async getAll(is_active = true) {
    return await http.GetRequest<ConsultationLevel[]>(
      Endpoints.IndigenousNationsConsultationLevels.GET_ALL,
      { is_active }
    );
  }
}
export default new IndigenousNationsConsultationLevels();
