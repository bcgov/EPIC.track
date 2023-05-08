import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import { Proponent } from "../../models/proponent";
const getProponents = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Proponents.GET_PROPONENTS
  );
};

const createProponent = async (proponent: Proponent) => {
  return await http.PostRequest(
    AppConfig.apiUrl + Endpoints.Proponents.GET_PROPONENTS,
    JSON.stringify(proponent)
  );
};

const updateProponent = async (proponent: Proponent) => {
  return await http.PutRequest(
    AppConfig.apiUrl + Endpoints.Proponents.GET_PROPONENTS + `/${proponent.id}`,
    JSON.stringify(proponent)
  );
};

const deleteProponent = async (id: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Proponents.GET_PROPONENTS + `/${id}`
  );
};

const getProponent = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Proponents.GET_PROPONENTS + `/${id}`
  );
};

const ProponentService = {
  getProponents,
  createProponent,
  updateProponent,
  deleteProponent,
  getProponent,
};

export default ProponentService;
