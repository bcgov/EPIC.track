export type ResourceForecastModel = {
    cairt_lead: string;
    capital_investment: number;
    ea_act: string;
    ea_type: string;
    eao_team: string;
    env_region: string;
    iaac: string;
    nrs_region: string;
    project_name: string;
    project_phase: string;
    referral_timing: string;
    responsible_epd: string;
    ['sector(sub)']: string;
    sl_no: number;
    sub_type: string;
    type: string;
    work_id: number;
    work_lead: string;
    work_team_members: string;
    months: Array<MonthColumn>;
}

interface MonthColumn {
    color: string;
    label: string;
    phase: string;
}