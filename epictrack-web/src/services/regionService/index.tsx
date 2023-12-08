import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

const getRegions = async () => {
  return await http.GetRequest(Endpoints.REGION.GET_ALL);
};

const codeService = {
  getCodes: getRegions,
};

export default codeService;
