import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class ProponentService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(Endpoints.Proponents.PROPONENTS);
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.Proponents.PROPONENTS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      Endpoints.Proponents.PROPONENTS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(Endpoints.Proponents.PROPONENTS + `/${id}`);
  }

  async getById(id: string) {
    return await http.GetRequest(Endpoints.Proponents.PROPONENTS + `/${id}`);
  }

  async checkProponentExists(name: string, id: number) {
    const encodedName = encodeURIComponent(name);
    return await http.GetRequest(
      Endpoints.Proponents.PROPONENTS +
        `/exists?name=${encodedName}${id ? "&proponent_id=" + id : ""}`
    );
  }
}
export default new ProponentService();
