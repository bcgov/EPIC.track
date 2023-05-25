import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
const getProjects = async (apiUrl?: string) => {
  return await http.GetRequest(
    (AppConfig.apiUrl || apiUrl) + Endpoints.Projects.GET_PROJECTS
  );
};

const getProject = async (id: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Projects.GET_PROJECTS + `/${id}`
  );
};

const createProjects = async (projectID: any, projectParams: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Projects.GET_PROJECTS,
    projectParams
  );
};

const updateProjects = async (projectID: any, projectParams: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Projects.GET_PROJECTS + `/${projectID}`,
    projectParams
  );
};
const deleteProjects = async (projectID: any) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Projects.GET_PROJECTS + `/${projectID}`
  );
};
const ProjectService = {
  getProject,
  getProjects,
  createProjects,
  updateProjects,
  deleteProjects,
};

export default ProjectService;
