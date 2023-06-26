import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import { IndigenousNation } from "../../models/indigenousNation";
const getIndigenousNations = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) +
      Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS
  );
};

const createIndigenousNation = async (indigenousNation: IndigenousNation) => {
  return await http.PostRequest(
    AppConfig.apiUrl + Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS,
    JSON.stringify(indigenousNation)
  );
};

const updateIndigenousNation = async (indigenousNation: IndigenousNation) => {
  return await http.PutRequest(
    AppConfig.apiUrl +
      Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS +
      `/${indigenousNation.id}`,
    JSON.stringify(indigenousNation)
  );
};

const deleteIndigenousNation = async (id: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl +
      Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS +
      `/${id}`
  );
};

const getIndigenousNation = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS +
      `/${id}`
  );
};

const checkIndigenousNationExists = async (name: string, id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.IndigenousNations.GET_INDIGENOUS_NATIONS +
      `/exists?name=${name}${id ? "&indigenous_nation_id=" + id : ""}`
  );
};

const IndigenousNationService = {
  getIndigenousNations,
  checkIndigenousNationExists,
  createIndigenousNation,
  updateIndigenousNation,
  deleteIndigenousNation,
  getIndigenousNation,
};

export default IndigenousNationService;
