export interface WorkType {
  id: number;
  is_active: boolean;
  name: string;
}

export enum WorkTypeEnum {
  PROJECT_NOTIFICATION = 1,
  MINISTERS_DESIGNATION = 2,
  CEAOS_DESIGNATION = 3,
  INTAKE_PRE_EA = 4,
  EXEMPTION_ORDER = 5,
  ASSESSMENT = 6,
  AMENDMENT = 7,
  POST_EAC_DOCUMENT_REVIEW = 8,
  EAC_EXTENSION = 9,
  SUBSTANTIAL_START_DECISION = 10,
  EAC_ORDER_TRANSFER = 11,
  EAC_ORDER_SUSPENSION = 12,
  EAC_ORDER_CANCELLATION = 13,
  OTHER = 14,
  MATERIAL_ALTERATION = 15,
  JOINT_COMPLEX_AMENDMENT = 16,
}

export const defaultWorkTypeReportDescriptions: Record<number, string> = {
  [WorkTypeEnum.PROJECT_NOTIFICATION]:
    "The proposed [Project Name] does not meet the threshold to automatically require an environmental assessment. However, it is [describe RPR threshold, e.g. within 15% of the threshold/would employ more than 250 full-time workers/produce more than 125,000 tonnes of greenhouse gasses per year/include a 230kv transmission line longer than 40kms/require clearing more than 40kms of land for a transmission line/pipeline/railway/highway/require clearing more than 450 hectares of land], which requires [Proponent Name] to notify the EAO of the project, to determine if an environmental assessment is required.",
  [WorkTypeEnum.MINISTERS_DESIGNATION]:
    "The proposed [project name] does not meet the threshold to automatically require an environmental assessment. However, the EAO has received an application from [name of applicant] for an assessment to be required.",
  [WorkTypeEnum.CEAOS_DESIGNATION]:
    "The proposed [project name] does not meet the threshold to automatically require an environmental assessment. However, the EAO has received an application from [name of applicant] for an assessment to be required.",
  [WorkTypeEnum.EXEMPTION_ORDER]:
    "On [date], [initiator] requested that the [project name] be exempted from requiring an environmental assessment certificate. The EAO will assess whether the project has significant adverse effects or serious effects to First Nations and their rights.",
  [WorkTypeEnum.ASSESSMENT]:
    "On [date], [initiator] entered the environmental assessment process.",
  [WorkTypeEnum.AMENDMENT]:
    "[Certificate Holder/Ministry] is proposing to make changes to the [Project Name] project. The changes proposed include [describe changes to project being sought]. These changes would require an amendment to the environmental assessment certificate for the project.",
  [WorkTypeEnum.EAC_EXTENSION]:
    "On [date], the Environmental Assessment Office received an application from [Certificate Holder] to extend the deadline of the EA Certificate for when the [Project Name] project must be substantially started.",
  [WorkTypeEnum.SUBSTANTIAL_START_DECISION]:
    "On [date], the [proponent/EAO] [requested a determination/began its determination] of whether the proposed [project name] is substantially started. The [project name]'s environmental assessment certificate will expire on [date] unless [project name] has been substantially started.",
  [WorkTypeEnum.EAC_ORDER_TRANSFER]:
    "[Former Holder] has proposed to transfer [the project]'s environmental assessment certificate to [Proposed New Holder], who would become the new Holder of the certificate if the transfer is approved.\n\n[Proposed New Holder] [is in the process of transferring/purchasing/has purchased/etc. as appropriate] [the Project from the] [Former Holder], which holds the environmental assessment certificate for the [Project Name] project, a [project type] [in/near location]. The environmental assessment certificate provides authorization for the project. The request to transfer the certificate to [New Holder] is currently under consideration by the EAO.",
  [WorkTypeEnum.MATERIAL_ALTERATION]:
    "On [date], [initiator] submitted a [work type] to [rationale/desired result/description of change].",
  [WorkTypeEnum.JOINT_COMPLEX_AMENDMENT]:
    "[Certificate Holder/Ministry] is proposing to make changes to the [Project Name] project. The changes proposed include [describe changes to project being sought]. These changes would require an amendment to the environmental assessment certificate for the project.",
};
