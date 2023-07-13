import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class ProponentService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(
      AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${id}`
    );
  }

  async getById(id: string) {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${id}`
    );
  }

  async checkProponentExists(name: string, id: number) {
    return await http.GetRequest(
      AppConfig.apiUrl +
        Endpoints.Proponents.PROPONENTS +
        `/exists?name=${name}${id ? "&proponent_id=" + id : ""}`
    );
  }
}
export default new ProponentService();
