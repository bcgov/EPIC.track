import React from "react";
import { SnackbarProvider, SnackbarProviderProps } from "notistack";
import ETNotification from "./components/ETNotification";
import {
  SuccessIconComponent,
  ErrorIconComponent,
  WarningIconComponent,
  InfoIconComponent,
} from "./components/icons";

const ETNotificationProvider = (props: SnackbarProviderProps) => {
  return (
    <SnackbarProvider
      {...props}
      Components={{
        etNotification: ETNotification,
      }}
      iconVariant={{
        success: <SuccessIconComponent className="notification-icon" />,
        error: <ErrorIconComponent className="notification-icon" />,
        warning: <WarningIconComponent className="notification-icon" />,
        info: <InfoIconComponent className="notification-icon" />,
      }}
      maxSnack={5}
    />
  );
};

export default ETNotificationProvider;
