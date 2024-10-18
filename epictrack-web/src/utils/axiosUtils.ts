import axios, { AxiosError } from "axios";
import { COMMON_ERROR_MESSAGE } from "../constants/application-constant";

export const getAxiosError = (error: any): AxiosError | null => {
  return axios.isAxiosError(error) ? (error as AxiosError) : null;
};

export const getErrorMessage = (_error: any): string => {
  const axiosError = getAxiosError(_error);
  if (axiosError) {
    const errorDate = axiosError.response?.data as any;
    return errorDate?.message || COMMON_ERROR_MESSAGE;
  }
  return COMMON_ERROR_MESSAGE;
};

export default {
  getAxiosError,
};
