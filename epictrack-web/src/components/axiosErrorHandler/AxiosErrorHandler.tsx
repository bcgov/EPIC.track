import { useEffect, useMemo } from "react";
import { AxiosInstance } from "../../apiManager/http-request-handler";
import { useAppDispatch } from "../../hooks";
import { setLoadingState } from "../../services/loadingService";

const AxiosErrorHandler = ({ ...props }) => {
  const dispatch = useAppDispatch();
  const methodsWithLoading = useMemo(() => ["post", "put", "delete"], []);

  useEffect(() => {
    // Request interceptor
    const requestInterceptor = AxiosInstance.interceptors.request.use(
      (request) => {
        // Do something here with request if you need to
        if (request.method && methodsWithLoading.includes(request.method)) {
          dispatch(setLoadingState(true));
        }
        return request;
      }
    );

    // Response interceptor
    const responseInterceptor = AxiosInstance.interceptors.response.use(
      (response) => {
        if (
          response.config.method &&
          methodsWithLoading.includes(response.config.method)
        ) {
          dispatch(setLoadingState(false));
        }
        // Handle response here
        return response;
      },
      (error) => {
        if (
          error.config.method &&
          methodsWithLoading.includes(error.config.method)
        ) {
          dispatch(setLoadingState(false));
        }
        dispatch(setLoadingState(false));
        // Handle errors here
        if (error.response?.status) {
          switch (error.response.status) {
            // case 401:
            //   // Handle Unauthenticated here
            //   break;
            // case 403:
            //   // Handle Unauthorized here
            //   break;
            // // ... And so on
            // case 422:
            //   console.log("ERROR ", error.response?.data);
            //   break;
            default:
              throw error;
          }
        }

        return error;
      }
    );

    return () => {
      // Remove handlers here
      AxiosInstance.interceptors.request.eject(requestInterceptor);
      AxiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return props.children;
};

export default AxiosErrorHandler;
