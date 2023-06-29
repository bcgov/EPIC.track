import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import { WorkTombstone } from "../../models/work";
const getWorks = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Works.WORKS
  );
};

const createWork = async (work: WorkTombstone) => {
  return await http.PostRequest(
    AppConfig.apiUrl + Endpoints.Works.WORKS,
    JSON.stringify(work)
  );
};

const updateWork = async (work: WorkTombstone) => {
  return await http.PutRequest(
    AppConfig.apiUrl + Endpoints.Works.WORKS + `/${work.id}`,
    JSON.stringify(work)
  );
};

const getWork = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Works.WORKS + `/${id}`
  );
};

const deleteWork = async (id?: number) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Works.WORKS + `/${id}`
  );
};
const checkWorkExists = async (title: string, id?: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.Works.WORKS +
      `/exists?title=${title}${id ? "&id=" + id : ""}`
  );
};

const WorkService = {
  getWorks,
  checkWorkExists,
  createWork,
  getWork,
  updateWork,
  deleteWork,
};
export default WorkService;
