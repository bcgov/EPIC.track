import Endpoints from '../../constants/api-endpoint';
import http from '../../apiManager/http-request-handler'
import { AppConfig } from '../../config';
const getStaffs = async(apiUrl?: string) => {
    return await http.GetRequest((AppConfig.apiUrl|| apiUrl)+Endpoints.Staffs.GET_STAFFS)
}
const StaffService = {
    getStaffs
}
export default StaffService;