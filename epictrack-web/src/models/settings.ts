export interface StalenessSettings {
  id: number;
  staleness_type: StalenessSettingTypeEnum;
  warning_length: number;
  staleness_length: number;
  sort_order: number;
}

export enum StalenessSettingTypeEnum {
  ISSUES = "ISSUES",
  STATUS = "STATUS",
}

export const StalenessSettingTypeNames: Record<
  StalenessSettingTypeEnum,
  string
> = {
  [StalenessSettingTypeEnum.ISSUES]: "Issue",
  [StalenessSettingTypeEnum.STATUS]: "Status",
};
