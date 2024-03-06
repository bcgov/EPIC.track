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

export type WorkByTeam = {
  count: number;
  eao_team: string;
  eao_team_id: number;
};

export type WorkByLead = {
  count: number;
  work_lead: string;
  work_lead_id: number;
};
