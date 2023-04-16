export const APP_ENV =
  (window._env_ && window._env_.APP_ENV) ||
  process.env.APP_ENV ||
  "";
export const METRICS_URL =
  (window._env_ && window._env_.REACT_APP_METRICS_URL) ||
  process.env.REACT_APP_METRICS_URL;