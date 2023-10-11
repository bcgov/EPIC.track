import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";

class ProjectService implements ServiceBase {
  async getAll() {
    return await http.GetRequest(Endpoints.Projects.PROJECTS);
  }

  async getById(id: string) {
    return await http.GetRequest(Endpoints.Projects.PROJECTS + `/${id}`);
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
    return await http.GetRequest(
      Endpoints.Projects.PROJECTS +
        `/exists?name=${name}${id ? "&project_id=" + id : ""}`
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
}

export default new ProjectService();
