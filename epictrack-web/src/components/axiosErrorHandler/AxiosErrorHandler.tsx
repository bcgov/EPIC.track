import { ReactNode, useEffect, useMemo } from "react";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { apiClients } from "../../apiManager/clients";
import { ApiClient } from "../../apiManager/client";
import { useAppDispatch } from "../../hooks";
import { setLoadingState } from "../../services/loadingService";
import { showNotification } from "../shared/notificationProvider";

interface AxiosErrorHandlerProps {
  children?: ReactNode;
  clients?: ApiClient[];
}

const AxiosErrorHandler = ({
  clients = apiClients,
  ...props
}: AxiosErrorHandlerProps) => {
  const dispatch = useAppDispatch();
  const methodsWithLoading = useMemo(() => ["post", "put", "delete"], []);

  useEffect(() => {
    const onRequest = (request: InternalAxiosRequestConfig) => {
      if (request.method && methodsWithLoading.includes(request.method)) {
        dispatch(setLoadingState(true));
      }
      return request;
    };

    const onResponse = (response: AxiosResponse) => {
      if (
        response.config.method &&
        methodsWithLoading.includes(response.config.method)
      ) {
        dispatch(setLoadingState(false));
      }
      return response;
    };

    const onError = (error: any) => {
      if (
        error.config.method &&
        methodsWithLoading.includes(error.config.method)
      ) {
        dispatch(setLoadingState(false));
      }
      dispatch(setLoadingState(false));
      if (error.response?.status) {
        switch (error.response.status) {
          case 429: {
            const retryAfter = error.response.headers?.["retry-after"];
            showNotification(
              `Too many requests. Please try again in ${
                retryAfter ? `${retryAfter} seconds` : "a moment"
              }.`,
              { type: "error" },
            );
            throw error;
          }
          default:
            throw error;
        }
      }

      return error;
    };

    const attached = clients.map((client) => ({
      client,
      request: client.raw.interceptors.request.use(onRequest),
      response: client.raw.interceptors.response.use(onResponse, onError),
    }));

    return () => {
      attached.forEach(({ client, request, response }) => {
        client.raw.interceptors.request.eject(request);
        client.raw.interceptors.response.eject(response);
      });
    };
  }, [clients, dispatch, methodsWithLoading]);

  return <>{props.children}</>;
};

export default AxiosErrorHandler;
