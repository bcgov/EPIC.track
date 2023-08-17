export const DATE_FORMAT = "MM-DD-YYYY";
export const DISPLAY_DATE_FORMAT = "DD MMM YYYY";
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
};
export const PAGINATION_DEFAULT = {
  PAGE_SIZE: 10,
  PAGE_INDEX: 0,
};
export const COMMON_ERROR_MESSAGE = "Error during processing the request";
