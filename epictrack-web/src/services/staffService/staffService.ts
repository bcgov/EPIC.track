import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { Staff } from "../../models/staff";
import { MasterBase } from "../../models/type";
import ServiceBase from "../common/serviceBase";

class StaffService implements ServiceBase {
  async getAll(is_active = false) {
    return await http.GetRequest<Staff[]>(Endpoints.Staffs.STAFFS, {
      is_active,
    });
  }

  async getById(id: string, is_active = true) {
    return await http.GetRequest<Staff>(Endpoints.Staffs.STAFFS + `/${id}`, {
      is_active,
    });
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.Staffs.STAFFS,
      JSON.stringify(data),
    );
  }

  async update(data: MasterBase, id: any) {
    return await http.PutRequest(
      Endpoints.Staffs.STAFFS + `/${id}`,
      JSON.stringify(data),
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(Endpoints.Staffs.STAFFS + `/${id}`);
  }

  async getActiveStaffByPosition(position: string) {
    return await http.GetRequest<Staff[]>(
      Endpoints.Staffs.STAFFS + `?positions=${position}`,
    );
  }

  async getAllStaffByPosition(position: string) {
    return await http.GetRequest<Staff[]>(
      Endpoints.Staffs.STAFFS + `?positions=${position}&is_active=false`,
    );
  }

  async validateEmail(email: string, staffID: number | undefined = undefined) {
    let params = `email=${email}`;
    if (staffID !== undefined) params += `&staff_id=${staffID}`;
    return await http.GetRequest(Endpoints.Staffs.STAFFS + `/exists?${params}`);
  }

  async getByEmail(email: string) {
    return await http.GetRequest<Staff>(Endpoints.Staffs.STAFFS + `/${email}`);
  }
}

const staffService = new StaffService();
export default staffService;
