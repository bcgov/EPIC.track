import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAppSelector } from "../../../hooks";

export const Loader = () => {
  // Loading state changes handled in src\components\axiosErrorHandler\AxiosErrorHandler.tsx
  const loadingState = useAppSelector((state) => state.loadingState);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      open={loadingState.isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
