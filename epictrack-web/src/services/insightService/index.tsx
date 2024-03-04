import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AssessmentByPhase, WorkByType } from "models/insights";

export const getWorkByType = async () => {
  return await http.GetRequest<WorkByType[]>(Endpoints.Insights.WORK_BY_TYPE);
};

export const getAssessmentByPhase = async () => {
  return await http.GetRequest<AssessmentByPhase[]>(
    Endpoints.Insights.ASSESSMENT_BY_PHASE
  );
};
