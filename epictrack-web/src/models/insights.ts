export type PieChartData = {
  name: string;
  value: number;
};

export type WorkByType = {
  count: number;
  work_type: string;
  work_type_id: number;
};

export type AssessmentByPhase = {
  count: number;
  phase: string;
  phase_id: number;
};

export type WorkByMinistry = {
  count: number;
  ministry: string;
  ministry_id: number;
};

export type WorkByFederalInvolvement = {
  count: number;
  federal_involvement: string;
  federal_involvement_id: number;
};

export type WorkByNation = {
  count: number;
  first_nation: string;
  first_nation_id: number;
};

export type ProjectByType = {
  count: number;
  type: string;
  type_id: number;
};

export type ProjectBySubtype = {
  count: number;
  sub_type: string;
  sub_type_id: number;
};
