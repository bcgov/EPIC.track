import Endpoints from '../../constants/api-endpoint';
import http from '../../apiManager/http-request-handler'
import { AppConfig } from '../../config';
import { Staff } from '../../models/staff';
const getStaffs = async (apiUrl?: string) => {
  return await http.GetRequest((AppConfig.apiUrl || apiUrl) + Endpoints.Staffs.STAFF);
}

const createStaff = async (staff: Staff) => {
  return await http.PostRequest(AppConfig.apiUrl+Endpoints.Staffs.STAFF,JSON.stringify(staff));
}

const updateStaff = async (staff: Staff) => {
  return await http.PutRequest(AppConfig.apiUrl+Endpoints.Staffs.STAFF+`/${staff.id}`, JSON.stringify(staff));
}

const getStaff = async (id: number) => {
  return await http.GetRequest(AppConfig.apiUrl+Endpoints.Staffs.STAFF+`/${id}`);
}

const deleteStaff = async (id?: number) => {
  return await http.DeleteRequest(AppConfig.apiUrl+Endpoints.Staffs.STAFF+`/${id}`);
}
const StaffService = {
  getStaffs,
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff
}
export default StaffService;