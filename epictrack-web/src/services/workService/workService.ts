import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import ServiceBase from "../common/serviceBase";
import { MasterBase } from "../../models/type";
import { StaffWorkRole } from "../../models/staff";
import { WorkFirstNation } from "../../models/firstNation";
import { Work, WorkPhase } from "../../models/work";
import { WorkType } from "../../models/workType";
import { AxiosResponse } from "axios";
interface WorkPhaseResponse {
  work_phase: WorkPhase;
}
class WorkService implements ServiceBase {
  async getAll(is_active = undefined) {
    return await http.GetRequest<Work[]>(Endpoints.Works.WORKS, { is_active });
  }

  async create(data: MasterBase) {
    return await http.PostRequest(Endpoints.Works.WORKS, JSON.stringify(data));
  }

  async update(data: MasterBase, id: string) {
    return await http.PutRequest(
      Endpoints.Works.WORKS + `/${id}`,
      JSON.stringify(data)
    );
  }

  async getById(id: string) {
    return await http.GetRequest<Work>(Endpoints.Works.WORKS + `/${id}`);
  }

  async delete(id?: string) {
    return await http.DeleteRequest(Endpoints.Works.WORKS + `/${id}`);
  }

  async checkWorkExists(title: string, id?: string) {
    const encodedTitle = encodeURIComponent(title);
    return await http.GetRequest(
      Endpoints.Works.WORKS +
        `/exists?title=${encodedTitle}${id ? "&work_id=" + id : ""}`
    );
  }

  async getWorkStaffDetails() {
    return await http.GetRequest(Endpoints.Works.WORK_RESOURCES);
  }

  async getWorkTeamMembers(workId: number, isActive: any = undefined) {
    let query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString()
    )}`;
    if (isActive !== undefined) {
      query += `?is_active=${isActive}`;
    }
    return await http.GetRequest(query);
  }

  async updateWorkStaff(data: StaffWorkRole, workStaffId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBER.replace(
      ":work_staff_id",
      workStaffId.toString()
    )}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async createWorkStaff(data: StaffWorkRole, workId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString()
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async checkWorkStaffExists(
    workId: number,
    staffId: number,
    roleId: number,
    workStaffId?: number
  ) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBERS.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest(
      query +
        `/exists?staff_id=${staffId}&role_id=${roleId}${
          workStaffId ? "&work_staff_id=" + workStaffId : ""
        }`
    );
  }

  async getWorkTeamMember(workStaffId: number) {
    const query = `${Endpoints.Works.WORK_TEAM_MEMBER.replace(
      ":work_staff_id",
      workStaffId.toString()
    )}`;
    return await http.GetRequest(query);
  }

  async getWorkPhases(workId: string) {
    return await http.GetRequest(Endpoints.Works.WORKS + `/${workId}/phases`);
  }

  async getWorkPhaseById(workPhaseId: number): Promise<WorkPhase | null> {
    try {
      const endpoint = Endpoints.Works.GET_WORK_PHASE_BY_ID.replace(
        ":work_phase_id",
        workPhaseId.toString()
      );
      const result: AxiosResponse<WorkPhaseResponse> = await http.GetRequest(
        endpoint
      );

      if (!result.data || !result.data.work_phase) {
        console.error(`No work phase found with ID: ${workPhaseId}`);
        return null;
      }

      return result.data.work_phase;
    } catch (error) {
      console.error(`Error fetching work phase with ID: ${workPhaseId}`, error);
      return null;
    }
  }

  async downloadWorkplan(workPhaseId: number) {
    return await http.PostRequest(
      Endpoints.Works.DOWNLOAD_WORK_PLAN + `?work_phase_id=${workPhaseId}`,
      {},
      {},
      {
        responseType: "blob",
      }
    );
  }

  async checkTemplateUploadStatus(workPhaseId: number) {
    const url = Endpoints.Works.CHECK_TEMPLATE_UPLOAD_STATUS.replace(
      ":work_phase_id",
      workPhaseId.toString()
    );
    return await http.GetRequest(url);
  }

  async saveFirstNationNotes(workId: number, notes: string) {
    const url = Endpoints.Works.WORK_FIRST_NATION_NOTES.replace(
      ":work_id",
      workId.toString()
    );
    return await http.PatchRequest(url, { notes });
  }

  async saveNotes(workId: number, notes: string, note_type: string) {
    const url = Endpoints.Works.WORK_NOTES.replace(
      ":work_id",
      workId.toString()
    );
    return await http.PatchRequest<Work>(url, { notes, note_type });
  }

  async getWorkFirstNations(workId: number) {
    const url = Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString()
    );
    return await http.GetRequest(url);
  }

  async getWorkFirstNation(workNationId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATION.replace(
      ":work_first_nation_id",
      workNationId.toString()
    )}`;
    return await http.GetRequest(query);
  }

  async updateFirstNation(data: WorkFirstNation, workNationId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATION.replace(
      ":work_first_nation_id",
      workNationId.toString()
    )}`;
    return await http.PutRequest(query, JSON.stringify(data));
  }

  async createFirstNation(data: WorkFirstNation, workId: number) {
    const query = `${Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString()
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async importFirstNations(workId: number, data: any) {
    const query = `${Endpoints.Works.WORK_IMPORT_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString()
    )}`;

    return await http.PostRequest(query, JSON.stringify(data));
  }

  async downloadFirstNations(workId: number) {
    return await http.PostRequest(
      Endpoints.Works.DOWNLOAD_WORK_FIRST_NATIONS.replace(
        ":work_id",
        workId.toString()
      ),
      {},
      {},
      {
        responseType: "blob",
      }
    );
  }
  async checkWorkNationExists(
    workId: number,
    indigenous_nation_id: number,
    work_indigenous_nation_id: number | undefined
  ) {
    const query = `${Endpoints.Works.WORK_FIRST_NATIONS.replace(
      ":work_id",
      workId.toString()
    )}`;
    return await http.GetRequest(query + "/exists", {
      indigenous_nation_id,
      work_indigenous_nation_id,
    });
  }

  async getWorkTypes() {
    return await http.GetRequest<WorkType[]>(Endpoints.WorkTypes.GET_ALL);
  }
}
export default new WorkService();
