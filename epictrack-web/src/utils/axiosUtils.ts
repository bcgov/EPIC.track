import axios, { AxiosError } from "axios";
import { COMMON_ERROR_MESSAGE } from "../constants/application-constant";
import { isApiError, readErrorMessage } from "../apiManager/apiError";

export const getAxiosError = (error: any): AxiosError | null => {
  return axios.isAxiosError(error) ? (error as AxiosError) : null;
};

export const getErrorMessage = (_error: any): string => {
  if (isApiError(_error)) return _error.message;
  const axiosError = getAxiosError(_error);
  if (axiosError) {
    return readErrorMessage(axiosError.response?.data) ?? COMMON_ERROR_MESSAGE;
  }
  return COMMON_ERROR_MESSAGE;
};

const axiosUtils = {
  getAxiosError,
};

export default axiosUtils;
