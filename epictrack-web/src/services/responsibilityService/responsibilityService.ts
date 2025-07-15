import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

class ResponsibilityService {
  getResponsibilities = async () => {
    return await http.GetRequest(Endpoints.Responsibilities.RESPONSIBILITIES);
  };
}

export const responsibilityService = new ResponsibilityService();
