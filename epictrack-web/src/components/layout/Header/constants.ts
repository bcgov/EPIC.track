export const HEADER_HEIGHT = 72;
export const EMPTY_ENV_BANNER_HEIGHT = 8;
export const ENV_BANNER_HEIGHT = 40;

export const getTotalHeaderHeight = (showEnvBanner: boolean) => {
  return showEnvBanner ? HEADER_HEIGHT + ENV_BANNER_HEIGHT : HEADER_HEIGHT;
};
