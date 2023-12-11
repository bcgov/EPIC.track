import axios, { AxiosError } from "axios";
import { COMMON_ERROR_MESSAGE } from "../constants/application-constant";

export const getAxiosError = (error: any): AxiosError => {
  return axios.isAxiosError(error) ? (error as AxiosError) : error;
};

export const getErrorMessage = (error: any): string => {
  const e = getAxiosError(error);
  return error?.response?.status === 422
    ? error.response.data.message?.toString()
    : COMMON_ERROR_MESSAGE;
};

export default {
  getAxiosError,
};
