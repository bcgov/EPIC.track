export type ResourceForecastModel = {
  work_title: string;
  capital_investment: number;
  fte_positions_operation: number;
  fte_positions_construction: number;
  ea_type: string;
  project_phase: string;
  ea_act: string;
  iaac: string;
  ["sector(sub)"]: string;
  env_region: string;
  nrs_region: string;
  responsible_epd: string;
  cairt_lead: string;
  eao_team: string;
  work_lead: string;
  work_team_members: string;
  referral_timing: string;

  sl_no: number;
  sub_type: string;
  type: string;
  work_id: number;
  months: Array<MonthColumn>;
  pre_ea: boolean;
};

interface MonthColumn {
  color: string;
  label: string;
  phase: string;
}
