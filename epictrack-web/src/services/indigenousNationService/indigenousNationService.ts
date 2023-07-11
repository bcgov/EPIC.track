import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class IndigenousNationService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.IndigenousNations.INDIGENOUS_NATIONS
    );
  }

  async getById(id: string) {
    return await http.GetRequest(
      AppConfig.apiUrl +
        Endpoints.IndigenousNations.INDIGENOUS_NATIONS +
        `/${id}`
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      AppConfig.apiUrl + Endpoints.IndigenousNations.INDIGENOUS_NATIONS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: any) {
    return await http.PutRequest(
      AppConfig.apiUrl +
        Endpoints.IndigenousNations.INDIGENOUS_NATIONS +
        `/${id}`,
      JSON.stringify(data)
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(
      AppConfig.apiUrl +
        Endpoints.IndigenousNations.INDIGENOUS_NATIONS +
        `/${id}`
    );
  }
  async checkIndigenousNationExists(name: string, id: number) {
    return await http.GetRequest(
      AppConfig.apiUrl +
        Endpoints.IndigenousNations.INDIGENOUS_NATIONS +
        `/exists?name=${name}${id ? "&indigenous_nation_id=" + id : ""}`
    );
  }
}
export default new IndigenousNationService();
