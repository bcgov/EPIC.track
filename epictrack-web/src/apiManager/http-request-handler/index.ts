// Legacy Track API helpers returning raw AxiosResponses; new code uses src/api.
// The Track client's interceptor adds the Authorization header.
import { trackClient } from "../clients";

const instance = trackClient.raw;

const GetRequest = <T>(url: string, params = {}, headers = {}) => {
  return instance.get<T>(url, {
    params: params,
    headers: {
      "Content-type": "application/json",
      ...headers,
    },
  });
};

const PostRequest = <T>(url: string, data = {}, params = {}, config = {}) => {
  return instance.post<T>(url, data, {
    params,
    headers: {
      "Content-type": "application/json",
    },
    ...config,
  });
};

const PutRequest = <T>(url: string, data = {}, params = {}) => {
  return instance.put<T>(url, data, {
    params,
    headers: {
      "Content-type": "application/json",
    },
  });
};

const PatchRequest = <T>(url: string, data = {}) => {
  return instance
    .patch<T>(url, data, {
      headers: {
        "Content-type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("PatchRequest - Error:", error);
      throw error;
    });
};

const DeleteRequest = <T>(url: string, params = {}) => {
  return instance.delete<T>(url, {
    params: params,
    headers: {
      "Content-type": "application/json",
    },
  });
};

const MultipartFormPostRequest = <T>(
  url: string,
  data = {},
  params = {},
  config = {},
) => {
  return instance.post<T>(url, data, {
    params,
    headers: {
      "Content-type": "multipart/form-data",
    },
    ...config,
  });
};

export default {
  GetRequest,
  PostRequest,
  PutRequest,
  PatchRequest,
  DeleteRequest,
  MultipartFormPostRequest,
};

export const AxiosInstance = instance;
