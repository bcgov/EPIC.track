import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";
import { ListType } from "../../models/code";
import { Project } from "models/project";

class ProjectService implements ServiceBase {
  async getAll(return_type?: string, with_works?: boolean) {
    return await http.GetRequest<Project[]>(Endpoints.Projects.PROJECTS, {
      return_type,
      with_works,
    });
  }

  async getById(id: string) {
    return await http.GetRequest<Project>(
      Endpoints.Projects.PROJECTS + `/${id}`
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.Projects.PROJECTS,
      JSON.stringify(data)
    );
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      Endpoints.Projects.PROJECTS + `/${id}`,
      JSON.stringify(data)
    );
  }
  async delete(id: string) {
    return await http.DeleteRequest(Endpoints.Projects.PROJECTS + `/${id}`);
  }

  async checkProjectExists(name: string, id: number) {
    const encodedName = encodeURIComponent(name);
    return await http.GetRequest(
      Endpoints.Projects.PROJECTS +
        `/exists?name=${encodedName}${id ? "&project_id=" + id : ""}`
    );
  }

  async getWorkTypes(projectId: number, workId: number) {
    return await http.GetRequest(
      Endpoints.Projects.WORK_TYPES.replace(
        ":project_id",
        projectId.toString()
      ) + `?work_id=${workId}`
    );
  }

  async getFirstNations(
    projectId: number,
    work_id: number,
    work_type_id: number | undefined
  ) {
    const url = Endpoints.Projects.FIRST_NATIONS.replace(
      ":project_id",
      projectId.toString()
    );
    return await http.GetRequest(url, { work_id, work_type_id });
  }

  async checkFirstNationAvailability(projectId: number, work_id: number) {
    const url = Endpoints.Projects.FIRST_NATION_AVAILABLE.replace(
      ":project_id",
      projectId.toString()
    );
    return await http.GetRequest(url, { work_id });
  }

  async createProjectAbbreviation(name: string) {
    return await http.PostRequest(
      Endpoints.Projects.PROJECT_ABBREVIATION,
      JSON.stringify({
        name,
      })
    );
  }

  async getProjectTypes() {
    return await http.GetRequest<ListType[]>(Endpoints.ProjectTypes.GET_ALL);
  }
}

export default new ProjectService();
