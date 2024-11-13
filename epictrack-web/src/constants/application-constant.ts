export const DATE_FORMAT = "YYYY-MM-DD";
export const DISPLAY_DATE_FORMAT = "DD MMM YYYY";
export const MONTH_DAY_YEAR = "MMM.DD YYYY";
export const EARLIEST_WORK_DATE = "2019-12-16";
export const MIN_WORK_START_DATE = "1995-06-30";
export const REPORT_TYPES = [
  {
    Text: "Anticipated EA Referral Schedule",
    Value: "ea_anticipated_schedule",
  },
  {
    Text: "Resource Forecast",
    Value: "ea_resource_forecast",
  },
  {
    Text: "30-60-90",
    Value: "30-60-90",
  },
  {
    Text: "Event Calendar",
    Value: "event_calendar",
  },
];
export const RESULT_STATUS = {
  LOADING: "loading",
  NO_RECORD: "no_record",
  LOADED: "loaded",
  ERROR: "error",
};
export const REPORT_TYPE = {
  EA_REFERRAL: "ea_anticipated_schedule",
  RESOURCE_FORECAST: "ea_resource_forecast",
  REPORT_30_60_90: "30-60-90",
  EVENT_CALENDAR: "event_calendar",
};
export const PAGINATION_DEFAULT = {
  PAGE_SIZE: 10,
  PAGE_INDEX: 0,
};
export const COMMON_ERROR_MESSAGE = "Error during processing the request";
export const ACTIVE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const FN_RESOURCES = [
  {
    title: "Link to Consultative Areas Database (CAD)",
    url: "https://arcmaps.gov.bc.ca/ess/hm/cadb/",
    description:
      "A version of iMapBC that allows users to view First Nation territorial and reserve boundaries, as well as cultural, heritage, and traditional use sites.",
  },
  {
    title: "Link to Profile of Indigenous Peoples (PIP)",
    url: "https://apps.nrs.gov.bc.ca/int/fnp/",
    description:
      "Resource for contact information, consultation advice, and consultation area maps for Indigenous Peoples in BC and neighbouring regions.",
  },
  {
    title: "Link to Agreement, Rights and Title System (ARTS)",
    url: "https://apps.nrs.gov.bc.ca/int/arts/index.xhtml?tab=agreements",
    description:
      "Database of agreements between Indigenous organizations and the government and Indigenous organization's established rights or title as decided by a court.",
  },
  {
    title: "Link to E-Guide",
    url: "https://intranet.gov.bc.ca/eao/our-work/eguide-2018/engaging-indigenous-nations",
    description:
      "EAO procedural information, templates, policies and guidance for all aspects of the 2018 Environmental Assessment process.",
  },
  {
    title: "Link to Consultation Guide (C-Guide)",
    url: "https://cguide.nrs.gov.bc.ca/",
    description:
      "Information, guidance and tools regarding the government's section 35 consultation obligations.",
  },
];

export const EPIC_SUPPORT_LINKS = {
  SPECIAL_HISTORY:
    "https://intranet.qa.gov.bc.ca/eao/digital-services/support-for-epic-system/support-for-epic-track/reports#specialhistory",
};

export const ABOUT_RESOURCES = [
  {
    title: "Link to eGuide",
    url: "https://intranet.gov.bc.ca/eao/our-work/eguide-2018",
  },
  {
    title: "Link to EA Act (2018)",
    url: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/18051",
  },
];

export const GROUPS = {
  SUPER_USER: "Super User",
  DEVELOPER: "Developer",
  INSTANCE_ADMIN: "Instance Admin",
};

export const ROLES = {
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  DEFAULT_ROLES_EAO_EPIC: "default-roles-eao-epic",
  MANAGE_USERS: "manage_users",
  EXTENDED_EDIT: "extended_edit",
};

export enum SpecialFieldEntityEnum {
  PROJECT = "PROJECT",
  PROPONENT = "PROPONENT",
  WORK = "WORK",
}

export const SPECIAL_FIELDS = Object.freeze({
  PROJECT: {
    NAME: "name",
    PROPONENT: "proponent_id",
  },
  PROPONENT: {
    NAME: "name",
  },
  WORK: {
    RESPONSIBLE_EPD: "responsible_epd_id",
    WORK_LEAD: "work_lead_id",
  },
});

export const MILESTONE_TYPES = Object.freeze({
  REFERRAL: 5,
});

export enum StalenessEnum {
  CRITICAL = "CRITICAL",
  WARN = "WARN",
  GOOD = "GOOD",
}

export const REPORT_STALENESS_THRESHOLD = {
  [REPORT_TYPE.EA_REFERRAL]: {
    [StalenessEnum.CRITICAL]: 10,
    [StalenessEnum.WARN]: 5,
  },
  [REPORT_TYPE.REPORT_30_60_90]: {
    [StalenessEnum.CRITICAL]: 10,
    [StalenessEnum.WARN]: 7,
  },
};

export const basePIPUrl = "https://apps.nrs.gov.bc.ca/int/fnp/#/organizations/";

export const DATE_CALCULATION_TYPES = [
  {
    label: "Day Zero",
    value: "dayZero",
  },
  {
    label: "Calendar",
    value: "regular",
  },
  {
    label: "Suspension",
    value: "suspended",
  },
];
