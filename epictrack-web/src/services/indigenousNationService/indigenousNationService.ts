import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class IndigenousNationService implements ServiceBase {
  async getAll(is_active = false) {
    return await http.GetRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS,
      { is_active }
    );
  }

  async getById(id: string) {
    return await http.GetRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS + `/${id}`
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: any) {
    return await http.PutRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS + `/${id}`
    );
  }
  async checkIndigenousNationExists(name: string, id: number) {
    const encodedName = encodeURIComponent(name);
    return await http.GetRequest(
      Endpoints.IndigenousNations.INDIGENOUS_NATIONS +
        `/exists?name=${encodedName}${id ? "&indigenous_nation_id=" + id : ""}`
    );
  }
}
export default new IndigenousNationService();
