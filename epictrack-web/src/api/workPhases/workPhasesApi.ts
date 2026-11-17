import { trackClient } from "apiManager/clients";
import { ListType } from "models/code";
import {
  OverageResponsibilityInput,
  PhaseOverageResponsibility,
} from "models/phaseOverageResponsibilities";
import {
  TemplateStatus,
  WorkPhase,
  WorkPhaseAdditionalInfo,
} from "models/work";
import {
  TrackOverageResponsibilityDto,
  TrackPhaseDto,
  TrackTemplateStatusDto,
  TrackWorkPhaseDto,
  TrackWorkPhaseInfoDto,
} from "./dto";
import {
  toOverageResponsibility,
  toOverageResponsibilityWriteDto,
  toPhaseCode,
  toTemplateStatus,
  toWorkPhase,
  toWorkPhaseAdditionalInfo,
} from "./mapper";

/** A plain object so Cypress can stub its methods. */
export const workPhasesApi = {
  listForWork: async (workId: number): Promise<WorkPhaseAdditionalInfo[]> =>
    (
      await trackClient.get<TrackWorkPhaseInfoDto[]>(`works/${workId}/phases`)
    ).map(toWorkPhaseAdditionalInfo),

  getInfo: async (
    workId: number,
    workPhaseId: number,
  ): Promise<WorkPhaseAdditionalInfo | undefined> => {
    const [first] = await trackClient.get<TrackWorkPhaseInfoDto[]>(
      `works/${workId}/phase/${workPhaseId}/additionalinfo`,
    );
    return first && toWorkPhaseAdditionalInfo(first);
  },

  get: async (workPhaseId: number): Promise<WorkPhase> => {
    const result = await trackClient.get<{ work_phase: TrackWorkPhaseDto }>(
      `works/work-phases/${workPhaseId}`,
    );
    return toWorkPhase(result.work_phase);
  },

  getTemplateUploadStatus: async (
    workPhaseId: number,
  ): Promise<TemplateStatus> =>
    toTemplateStatus(
      await trackClient.get<TrackTemplateStatusDto>(
        `works/work-phases/${workPhaseId}/template-upload-status`,
      ),
    ),

  /** The work plan as an .xlsx file. */
  downloadWorkPlan: async (workPhaseId: number): Promise<Blob> =>
    trackClient.post<Blob>(
      "works/workplan/download",
      {},
      { params: { work_phase_id: workPhaseId }, responseType: "blob" },
    ),

  /** The phases configured for an EA act and work type. */
  listPhaseCodes: async (
    eaActId: number,
    workTypeId: number,
  ): Promise<ListType[]> =>
    (
      await trackClient.get<TrackPhaseDto[]>(
        `phases/ea_acts/${eaActId}/work_types/${workTypeId}`,
      )
    ).map(toPhaseCode),

  listOverageResponsibilities: async (
    workPhaseId: number,
  ): Promise<PhaseOverageResponsibility[]> =>
    (
      await trackClient.get<TrackOverageResponsibilityDto[]>(
        `works/work-phases/${workPhaseId}/overage-responsibilities`,
      )
    ).map(toOverageResponsibility),

  addOverageResponsibility: async (
    input: OverageResponsibilityInput,
  ): Promise<PhaseOverageResponsibility> =>
    toOverageResponsibility(
      await trackClient.post<TrackOverageResponsibilityDto>(
        "overage-responsibilities",
        toOverageResponsibilityWriteDto(input),
      ),
    ),

  removeOverageResponsibility: async (
    id: number,
    workId?: number,
  ): Promise<void> => {
    await trackClient.delete(`overage-responsibilities/${id}`, {
      params: { work_id: workId },
    });
  },

  saveOverageNotes: async (workPhaseId: number, notes: string) => {
    await trackClient.patch(
      `works/work-phases/${workPhaseId}/overage-responsibility-notes`,
      { notes },
    );
  },
};
