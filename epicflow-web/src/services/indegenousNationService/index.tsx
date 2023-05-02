import Endpoints from '../../constants/api-endpoint';
import http from '../../apiManager/http-request-handler'
import { AppConfig } from '../../config';

const getStaffPositions = async (staffParams: any) => {
  return await http.GetRequest(AppConfig.apiUrl + Endpoints.Staffs.GET_STAFFS, staffParams)
}

const getIndegenousNation = async (apiUrl?: string) => {
	return await http.GetRequest((AppConfig.apiUrl || apiUrl) + Endpoints.IndegenousNations.GET_INDEGENOUS_NATION)
   }

const IndegenousNationService = {
	getStaffPositions,
	getIndegenousNation
}

export default IndegenousNationService;
