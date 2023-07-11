import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import Endpoints from "../../constants/api-endpoint";
import { MasterBase } from "../../models/type";
import ServiceBase from "../common/serviceBase";

class StaffService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(AppConfig.apiUrl + Endpoints.Staffs.STAFFS);
  }

  async getById(id: string) {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS + `/${id}`
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: any) {
    return await http.PutRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS + `/${id}`
    );
  }

  async getStaffByPosition(position: string) {
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS + `?positions=${position}`
    );
  }
  async validateEmail(email: string, staffID: number | undefined = undefined) {
    let params = `email=${email}`;
    if (staffID !== undefined) params += `&staff_id=${staffID}`;
    return await http.GetRequest(
      AppConfig.apiUrl + Endpoints.Staffs.STAFFS + `/exists?${params}`
    );
  }
}

export default new StaffService();
