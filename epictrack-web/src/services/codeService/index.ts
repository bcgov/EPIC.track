import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";

export type Code = "positions" | "ministries" | "proponents";

const getCodes = async (codeType: Code, apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Codes.GET_CODES + `/${codeType}`
  );
};

const codeService = {
  getCodes,
};

export default codeService;
