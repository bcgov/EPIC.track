import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { WorkIssue } from "../../models/Issue";

class IssueService {
  async getAll(workId: string) {
    const query = `${Endpoints.WorkIssues.ISSUES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest<WorkIssue[]>(query);
  }
}

export default new IssueService();
