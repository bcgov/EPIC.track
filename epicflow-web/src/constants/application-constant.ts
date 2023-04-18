export const DATE_FORMAT = 'YYYY-MM-DD';
export const REPORT_TYPES = [{
  Text: 'Anticipated EA Referral Schedule',
  Value: 'ea_anticipated_schedule'
}, {
  Text: 'Resource Forecast',
  Value: 'ea_resource_forecast'
},{
  Text: 'Report 30-60-90',
  Value: 'report_30_60_90'
}];
export const RESULT_STATUS = {
  LOADING: 'loading',
  NO_RECORD: 'no_record',
  LOADED: 'loaded',
  ERROR: 'error'
};
export const REPORT_TYPE = {
  EA_REFERRAL: 'ea_anticipated_schedule',
  RESOURCE_FORECAST: 'ea_resource_forecast',
  REPORT_30_60_90: 'report_30_60_90'
}
export const PAGINATION_DEFAULT = {
  PAGE_SIZE: 10,
  PAGE_INDEX: 0
}
