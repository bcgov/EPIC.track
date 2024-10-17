import axios from "axios";
import UserService from "../../services/userService";
import { AppConfig } from "../../config";

const instance = axios.create({
  baseURL: AppConfig.apiUrl,
});
const GetRequest = <T>(url: string, params = {}, headers = {}) => {
  return instance.get<T>(url, {
    params: params,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
      ...headers,
    },
  });
};

const PostRequest = <T>(url: string, data = {}, params = {}, config = {}) => {
  return instance.post<T>(url, data, {
    params,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
    },
    ...config,
  });
};

const PutRequest = <T>(url: string, data = {}, params = {}) => {
  return instance.put<T>(url, data, {
    params,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
    },
  });
};

const PatchRequest = <T>(url: string, data = {}) => {
  return instance.patch<T>(url, data, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
    },
  });
};

const DeleteRequest = <T>(url: string, params = {}) => {
  return instance.delete<T>(url, {
    params: params,
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
    },
  });
};

const MultipartFormPostRequest = <T>(
  url: string,
  data = {},
  params = {},
  config = {}
) => {
  return instance.post<T>(url, data, {
    params,
    headers: {
      "Content-type": "multipart/form-data",
      Authorization: `Bearer ${
        UserService.getToken() || window.localStorage.getItem("authToken")
      }`,
    },
    ...config,
  });
};

interface OSSRequestOptions {
  amzDate: string;
  authHeader: string;
}
export const OSSGetRequest = <T>(
  url: string,
  requestOptions: OSSRequestOptions
) => {
  return instance.get<T>(url, {
    headers: {
      "X-Amz-Date": requestOptions.amzDate,
      Authorization: requestOptions.authHeader,
    },
    responseType: "blob",
  });
};

export const OSSPutRequest = <T>(
  url: string,
  data: File,
  requestOptions: OSSRequestOptions
) => {
  return instance.put<T>(url, data, {
    headers: {
      "X-Amz-Date": requestOptions.amzDate,
      Authorization: requestOptions.authHeader,
    },
  });
};

export default {
  GetRequest,
  PostRequest,
  PutRequest,
  PatchRequest,
  DeleteRequest,
  OSSGetRequest,
  OSSPutRequest,
  MultipartFormPostRequest,
};

export const AxiosInstance = instance;
