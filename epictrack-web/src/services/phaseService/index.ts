import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";

const getPhaseByWorkTypeEAact = async (
  eaactid?: number,
  worktypeId?: number
) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.Phases.PHASES +
      `/ea_acts/${eaactid}/work_types/${worktypeId}  `
  );
};
const phaseService = {
  getPhaseByWorkTypeEAact,
};

export default phaseService;
