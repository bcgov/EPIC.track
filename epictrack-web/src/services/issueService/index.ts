import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { WorkIssue } from "../../models/Issue";
import { MasterBase } from "../../models/type";

class IssueService {
  async getAll(workId: string) {
    const query = `${Endpoints.WorkIssues.ISSUES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest<WorkIssue[]>(query);
  }

  async create(workId: string, data: MasterBase) {
    const query = `${Endpoints.WorkIssues.ISSUES.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.PostRequest(query, JSON.stringify(data));
  }

  async update(workId: string, issue_id: string, data: MasterBase) {
    let query = `${Endpoints.WorkIssues.UPDATE_ISSUE.replace(
      ":work_id",
      workId.toString()
    )}`;
    query = query.replace(":issue_id", issue_id.toString());
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async clone(workId: string, issue_id: string, data: MasterBase) {
    let query = `${Endpoints.WorkIssues.CLONE_UPDATE.replace(
      ":work_id",
      workId.toString()
    )}`;
    query = query.replace(":issue_id", issue_id.toString());
    return await http.PostRequest(query, JSON.stringify(data));
  }

  async approve(work_id: string, issue_id: string) {
    let query = `${Endpoints.WorkIssues.APPROVE_ISSUE.replace(
      ":work_id",
      work_id.toString()
    )}`;
    query = query.replace(":issue_id", issue_id.toString());
    return await http.PatchRequest(query);
  }
}

export default new IssueService();
