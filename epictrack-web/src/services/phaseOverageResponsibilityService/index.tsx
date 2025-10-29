import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { PhaseOverageResponsibility } from "../../models/phaseOverageResponsibilities";
import { MasterBase } from "../../models/type";
import ServiceBase from "../common/serviceBase";

class PhaseOverageResponsibilityService implements ServiceBase {
  async getAll(is_active = true) {
    return await http.GetRequest<PhaseOverageResponsibility[]>(
      Endpoints.PhaseOverageResponsibilities.OVERAGE_RESPONSIBILITIES,
      {
        is_active,
      },
    );
  }

  async getById(id: string, is_active = true) {
    return await http.GetRequest<PhaseOverageResponsibility>(
      Endpoints.PhaseOverageResponsibilities.OVERAGE_RESPONSIBILITIES,
      +`/${id}`,
      {
        is_active,
      },
    );
  }

  async create(data: MasterBase) {
    return await http.PostRequest(
      Endpoints.PhaseOverageResponsibilities.OVERAGE_RESPONSIBILITIES,
      JSON.stringify(data),
    );
  }

  async update(data: MasterBase, id: number) {
    return await http.PutRequest(
      Endpoints.PhaseOverageResponsibilities.OVERAGE_RESPONSIBILITIES +
        `/${id}`,
      JSON.stringify(data),
    );
  }

  async delete(id: string, params: any) {
    return await http.DeleteRequest(
      Endpoints.PhaseOverageResponsibilities.OVERAGE_RESPONSIBILITIES +
        `/${id}`,
      params,
    );
  }

  async getAllByPhaseId(work_phase_id: string) {
    return await http.GetRequest<PhaseOverageResponsibility[]>(
      Endpoints.Works.GET_OVERAGE_RESPONSIBILITY_BY_PHASE_ID.replace(
        ":work_phase_id",
        work_phase_id,
      ),
    );
  }
}

const phaseOverageResponsibilityService =
  new PhaseOverageResponsibilityService();
export default phaseOverageResponsibilityService;
