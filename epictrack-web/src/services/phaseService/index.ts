import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

const getPhaseByWorkTypeEAact = async (
  eaactid?: number,
  worktypeId?: number
) => {
  return await http.GetRequest(
    Endpoints.Phases.PHASES + `/ea_acts/${eaactid}/work_types/${worktypeId}  `
  );
};
const phaseService = {
  getPhaseByWorkTypeEAact,
};

export default phaseService;
