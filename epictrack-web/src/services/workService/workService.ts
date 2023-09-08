import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class WorkService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(Endpoints.Works.WORKS);
  }

  async create(data: MasterBase) {
    return await http.PostRequest(Endpoints.Works.WORKS, JSON.stringify(data));
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      Endpoints.Works.WORKS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async getById(id: string) {
    return await http.GetRequest(Endpoints.Works.WORKS + `/${id}`);
  }

  async delete(id?: string) {
    return await http.DeleteRequest(Endpoints.Works.WORKS + `/${id}`);
  }

  async checkWorkExists(title: string, id?: string) {
    return await http.GetRequest(
      Endpoints.Works.WORKS +
        `/exists?title=${title}${id ? "&work_id=" + id : ""}`
    );
  }

  async getWorkStaffDetails() {
    return await http.GetRequest(Endpoints.Works.WORK_RESOURCES);
  }

  async getWorkTeamMembers(workId: number, isActive: any = undefined) {
    let query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString()
    )}`;
    if (isActive !== undefined) {
      query += `?is_active=${isActive}`;
    }
    return await http.GetRequest(query);
  }

  async getWorkPhases(workId: string) {
    return await http.GetRequest(Endpoints.Works.WORKS + `/${workId}/phases`);
  }

  async downloadWorkplan(workId: number, phaseId: number) {
    return await http.PostRequest(
      Endpoints.Works.DOWNLOAD_WORK_PLAN +
        `?work_id=${workId}&phase_id=${phaseId}`,
      {},
      {},
      {
        responseType: "blob",
      }
    );
  }

  async checkTemplateUploadStatus(workId: string, phaseId: string) {
    const url = Endpoints.Works.CHECK_TEMPLATE_UPLOAD_STATUS.replace(
      ":work_id",
      workId
    ).replace(":phase_id", phaseId);
    return await http.GetRequest(url);
  }
}
export default new WorkService();
