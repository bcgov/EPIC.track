import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class WorkService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(AppConfig.apiUrl + Endpoints.Works.WORKS);
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      AppConfig.apiUrl + Endpoints.Works.WORKS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      AppConfig.apiUrl + Endpoints.Works.WORKS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async getById(id: string) {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Works.WORKS + `/${id}`
    );
  }

  async delete(id?: string) {
    return await http.DeleteRequest(
      AppConfig.apiUrl + Endpoints.Works.WORKS + `/${id}`
    );
  }

  async checkWorkExists(title: string, id?: string) {
    return await http.GetRequest(
      AppConfig.apiUrl +
        Endpoints.Works.WORKS +
        `/exists?title=${title}${id ? "&work_id=" + id : ""}`
    );
  }

  async getWorkStaffDetails() {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Works.WORK_RESOURCES
    );
  }

  async getWorkPhases(workId: string) {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Works.WORKS + `/${workId}/phases`
    );
  }
}
export default new WorkService();
