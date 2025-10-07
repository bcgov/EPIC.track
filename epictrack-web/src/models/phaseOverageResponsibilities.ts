export interface PhaseOverageResponsibility {
  id: number;
  responsibility: OverageResponsibilityEnum;
  is_active: boolean;
  work_phase_id: number;
}

export enum OverageResponsibilityEnum {
  PROPONENT = "Proponent",
  EAO = "EAO",
  SECONDARY_MINISTRY = "Secondary Ministry",
  FEDERAL_AGENCY = "Federal Agency",
  NATION = "Nation",
  PARTNER_AGENCY = "Partner Agency",
}

export const OverageResponsibilityLookup: Record<
  string,
  OverageResponsibilityEnum
> = Object.fromEntries(
  Object.entries(OverageResponsibilityEnum).map(([key, value]) => [
    value,
    key as OverageResponsibilityEnum,
  ]),
);
