import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { StaffWorkRole } from "../../models/staff";
import { WorkFirstNation } from "../../models/firstNation";
import { Work } from "../../models/work";
import { WorkResource } from "models/workResource";

// Track-owned calls under /works; work data goes through api/works.
class WorkService {
  async getWorkIdsByStaff(staffId: number) {
    return await http.GetRequest<number[]>(
      Endpoints.Works.WORKS_BY_STAFF.replace(":staff_id", staffId.toString()),
    );
  }

  async getWorkStaffDetails() {
    return await http.GetRequest(Endpoints.Works.WORK_RESOURCES);
  }

  async getWorkTeamMembers(workId: number, isActive: any = undefined) {
    let query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString(),
    )}`;
    if (isActive !== undefined) {
      query += `?is_active=${isActive}`;
    }
    return await http.GetRequest(query);
  }

  async updateWorkStaff(data: StaffWorkRole, workStaffId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBER.replace(
      ":work_staff_id",
      workStaffId.toString(),
    )}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async createWorkStaff(data: StaffWorkRole, workId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString(),
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async checkWorkStaffExists(
    workId: number,
    staffId: number,
    roleId: number,
    workStaffId?: number,
  ) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString(),
    )}`;
    return await http.GetRequest(
      query +
        `/exists?staff_id=${staffId}&role_id=${roleId}${
          workStaffId ? "&work_staff_id=" + workStaffId : ""
        }`,
    );
  }

  async getWorkTeamMember(workStaffId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBER.replace(
      ":work_staff_id",
      workStaffId.toString(),
    )}`;
    return await http.GetRequest(query);
  }

  async saveFirstNationNotes(workId: number, notes: string) {
    const url = Endpoints.Works.WORK_FIRST_NATION_NOTES.replace(
      ":work_id",
      workId.toString(),
    );
    return await http.PatchRequest(url, { notes });
  }

  async saveNotes(workId: number, notes: string, note_type: string) {
    const url = Endpoints.Works.WORK_NOTES.replace(
      ":work_id",
      workId.toString(),
    );
    return await http.PatchRequest<Work>(url, { notes, note_type });
  }

  async getWorkFirstNations(workId: number) {
    const url = Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString(),
    );
    return await http.GetRequest(url);
  }

  async getWorkFirstNation(workNationId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATION.replace(
      ":work_first_nation_id",
      workNationId.toString(),
    )}`;
    return await http.GetRequest(query);
  }

  async updateFirstNation(data: WorkFirstNation, workNationId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATION.replace(
      ":work_first_nation_id",
      workNationId.toString(),
    )}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async createFirstNation(data: WorkFirstNation, workId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString(),
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async importFirstNations(workId: number, data: any) {
    const query = `${Endpoints.Works.WORK_IMPORT_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString(),
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async downloadFirstNations(workId: number) {
    return await http.PostRequest(
      Endpoints.Works.DOWNLOAD_WORK_FIRST_NATIONS.replace(
        ":work_id",
        workId.toString(),
      ),
      {},
      {},
      {
        responseType: "blob",
      },
    );
  }
  async checkWorkNationExists(
    workId: number,
    indigenous_nation_id: number,
    work_indigenous_nation_id: number | undefined,
  ) {
    const query = `${Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString(),
    )}`;
    return await http.GetRequest(query + "/exists", {
      indigenous_nation_id,
      work_indigenous_nation_id,
    });
  }

  async getWorkResources(workId: number) {
    const query = `${Endpoints.WorkResources.GET_WORK_RESOURCES_BY_WORK.replace(
      ":work_id",
      workId.toString(),
    )}`;
    return await http.GetRequest<WorkResource[]>(query);
  }

  async deleteWorkResource(workResourceId: number) {
    const query = `${Endpoints.WorkResources.WORK_RESOURCE_BY_ID.replace(
      ":work_resource_id",
      workResourceId.toString(),
    )}`;
    return await http.DeleteRequest(query);
  }

  async updateWorkResource(workResourceId: number, data: any) {
    const query = `${Endpoints.WorkResources.WORK_RESOURCE_BY_ID.replace(
      ":work_resource_id",
      workResourceId.toString(),
    )}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async createWorkResource(workId: number, data: any) {
    const query = `${Endpoints.WorkResources.GET_WORK_RESOURCES_BY_WORK.replace(
      ":work_id",
      workId.toString(),
    )}`;
    return await http.PostRequest(query, JSON.stringify(data));
  }
}
export const workService = new WorkService();
