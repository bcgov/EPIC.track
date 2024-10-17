import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { ListType } from "../../models/code";

const getEaoTeams = async () => {
  return await http.GetRequest<ListType[]>(Endpoints.EAO_TEAMS.GET_ALL);
};

const EAOTeamService = {
  getEaoTeams,
};

export default EAOTeamService;
