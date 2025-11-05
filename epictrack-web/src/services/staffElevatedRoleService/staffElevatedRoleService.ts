import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { StaffElevatedRole } from "../../models/staff";
import { MasterBase } from "../../models/type";
import ServiceBase from "../common/serviceBase";

class StaffElevatedRoleService implements ServiceBase {
  async getAll(is_active = true) {
    return await http.GetRequest<StaffElevatedRole[]>(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES,
      {
        is_active,
      },
    );
  }

  async getById(id: string, is_active = true) {
    return await http.GetRequest<StaffElevatedRole>(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES + `/${id}`,
      {
        is_active,
      },
    );
  }

  async getActiveStaffElevatedRoleByStaffId(staff_id: string) {
    return await http.GetRequest<StaffElevatedRole[]>(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES +
        `?staff_id=${staff_id}`,
    );
  }

  async getAllStaffElevatedRoleByStaffId(staff_id: string) {
    return await http.GetRequest<StaffElevatedRole[]>(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES +
        `?staff_id=${staff_id}&is_active=false`,
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES,
      JSON.stringify(data),
    );
  }

  async update(data: MasterBase, id: number) {
    return await http.PutRequest(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES + `/${id}`,
      JSON.stringify(data),
    );
  }

  async delete(id: string) {
    return await http.DeleteRequest(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES + `/${id}`,
    );
  }

  async getStaffElevatedRoleByElevatedRoleId(role_id: string) {
    return await http.GetRequest<StaffElevatedRole[]>(
      Endpoints.StaffsElevatedRoles.STAFF_ELEVATED_ROLES +
        `?elevated_role_id=${role_id}`,
    );
  }
}

const staffElevatedRoleService = new StaffElevatedRoleService();
export default staffElevatedRoleService;
