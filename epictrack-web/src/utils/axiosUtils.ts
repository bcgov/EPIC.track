import axios, { AxiosError } from "axios";

export const getAxiosError = (error: any): AxiosError => {
  return axios.isAxiosError(error) ? (error as AxiosError) : error;
};

export default {
  getAxiosError,
};
