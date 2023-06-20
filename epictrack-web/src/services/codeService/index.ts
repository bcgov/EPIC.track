import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";

export type Code =
  | "positions"
  | "projects"
  | "ministries"
  | "proponents"
  | "ea_acts"
  | "work_types"
  | "eao_teams"
  | "regions"
  | "types"
  | "phases"
  | "sub_types"
  | "federal_involvements"
  | "substitution_acts";

const getCodes = async (codeType: Code, apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Codes.GET_CODES + `/${codeType}`
  );
};

const codeService = {
  getCodes,
};

export default codeService;
