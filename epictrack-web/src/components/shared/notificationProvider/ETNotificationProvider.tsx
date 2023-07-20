import React from "react";
import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SnackbarProvider, SnackbarProviderProps } from "notistack";
import ETNotification from "./components/ETNotification";
import { useAppSelector } from "../../../hooks";
import { StyleProps } from "./type";
import {
  SuccessIconComponent,
  ErrorIconComponent,
  WarningIconComponent,
  InfoIconComponent,
} from "./components/icons";

const useStyles = makeStyles<Theme, StyleProps>({
  withActionContainer: {
    position: "absolute",
    top: "75px",
    width: ({ drawerWidth }: StyleProps) => `calc(100% - ${drawerWidth}px)`,

    "& > div": {
      position: "relative",
      width: "100%",
      left: ({ drawerWidth }: StyleProps) => `calc(${drawerWidth}px / 2)`,
    },
  },
});

const ETNotificationProvider = (props: SnackbarProviderProps) => {
  const uiState = useAppSelector((state) => state.uiState);
  const drawerWidth = uiState.drawerWidth;
  const classes = useStyles({ drawerWidth });
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
      classes={{
        containerAnchorOriginTopCenter: classes.withActionContainer,
      }}
      maxSnack={5}
    />
  );
};

export default ETNotificationProvider;
