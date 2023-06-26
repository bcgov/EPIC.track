import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import { Proponent } from "../../models/proponent";
const getProponents = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Proponents.PROPONENTS
  );
};

const createProponent = async (proponent: Proponent) => {
  return await http.PostRequest(
    AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS,
    JSON.stringify(proponent)
  );
};

const updateProponent = async (proponent: Proponent) => {
  return await http.PutRequest(
    AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${proponent.id}`,
    JSON.stringify(proponent)
  );
};

const deleteProponent = async (id: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${id}`
  );
};

const getProponent = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Proponents.PROPONENTS + `/${id}`
  );
};

const checkProponentExists = async (name: string, id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.Proponents.PROPONENTS +
      `/exists?name=${name}${id ? "&id=" + id : ""}`
  );
};

const ProponentService = {
  getProponents,
  createProponent,
  updateProponent,
  deleteProponent,
  getProponent,
  checkProponentExists,
};

export default ProponentService;
