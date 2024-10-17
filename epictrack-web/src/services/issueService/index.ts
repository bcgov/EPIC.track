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

  async editIssue(workId: string, issue_id: string, data: MasterBase) {
    let query = `${Endpoints.WorkIssues.EDIT_ISSUE.replace(
      ":work_id",
      workId
    )}`;
    query = query.replace(":issue_id", issue_id);
    return await http.PatchRequest(query, JSON.stringify(data));
  }

  async editIssueUpdate(
    workId: string,
    issue_id: string,
    issue_update_id: string,
    data: MasterBase
  ) {
    let query = `${Endpoints.WorkIssues.EDIT_ISSUE_UPDATE.replace(
      ":work_id",
      workId
    )}`;
    query = query.replace(":issue_id", issue_id);
    query = query.replace(":issue_update_id", issue_update_id);
    return await http.PatchRequest(query, JSON.stringify(data));
  }

  async clone(workId: string, issue_id: string, data: MasterBase) {
    let query = `${Endpoints.WorkIssues.CLONE_UPDATE.replace(
      ":work_id",
      workId.toString()
    )}`;
    query = query.replace(":issue_id", issue_id.toString());
    return await http.PostRequest(query, JSON.stringify(data));
  }

  async approve(work_id: string, issue_id: string, issue_update_id: string) {
    let query = `${Endpoints.WorkIssues.APPROVE_ISSUE_UPDATE.replace(
      ":work_id",
      work_id.toString()
    )}`;
    query = query.replace(":issue_id", issue_id.toString());
    query = query.replace(":issue_update_id", issue_update_id.toString());
    return await http.PatchRequest(query);
  }
}

export default new IssueService();
