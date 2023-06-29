import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
const getProjects = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Projects.PROJECTS
  );
};

const getProject = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Projects.PROJECTS + `/${id}`
  );
};

const createProjects = async (projectParams: any) => {
  return await http.PostRequest(
    AppConfig.apiUrl + Endpoints.Projects.PROJECTS,
    projectParams
  );
};

const updateProjects = async (projectID: any, projectParams: any) => {
  return await http.PutRequest(
    AppConfig.apiUrl + Endpoints.Projects.PROJECTS + `/${projectID}`,
    projectParams
  );
};
const deleteProjects = async (projectID: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Projects.PROJECTS + `/${projectID}`
  );
};

const checkProjectExists = async (name: string, id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl +
      Endpoints.Projects.PROJECTS +
      `/exists?name=${name}${id ? "&project_id=" + id : ""}`
  );
};

const ProjectService = {
  getProject,
  getProjects,
  createProjects,
  updateProjects,
  deleteProjects,
  checkProjectExists,
};

export default ProjectService;
