import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

// Track-owned calls under /projects; project data goes through api/projects.
class ProjectService {
  async getFirstNations(
    projectId: number,
    work_id: number,
    work_type_id: number | undefined,
  ) {
    const url = Endpoints.Projects.FIRST_NATIONS.replace(
      ":project_id",
      projectId.toString(),
    );
    return await http.GetRequest(url, { work_id, work_type_id });
  }

  async checkFirstNationAvailability(projectId: number, work_id: number) {
    const url = Endpoints.Projects.FIRST_NATION_AVAILABLE.replace(
      ":project_id",
      projectId.toString(),
    );
    return await http.GetRequest(url, { work_id });
  }
}

export const projectService = new ProjectService();
