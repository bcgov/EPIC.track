import React from "react";
import { Box, IconButton } from "@mui/material";
import { useSnackbar, SnackbarContent } from "notistack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { Palette } from "../../../../styles/theme";
import { CloseIconComponent } from "./icons";
import { ETNotificationProps } from "../type";

const ETNotification = React.forwardRef<HTMLDivElement, ETNotificationProps>(
  (props, ref) => {
    const {
      id,
      message,
      type,
      helpText: HelpText,
      actions,
      iconVariant,
      ...other
    } = props;
    const { closeSnackbar } = useSnackbar();

    const handleDismiss = React.useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    const helpTextComponent = React.useMemo(() => {
      return (
        React.isValidElement(HelpText) ? (
          // { helpText }
          HelpText
        ) : (
          <Typography>{HelpText}</Typography>
        )
      ) as React.ReactElement;
    }, [HelpText]);

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        {...other}
        style={{
          minWidth: "600px",
          display: "flex",
          padding: "16px 24px",
          gap: "16px",
          flexDirection: "column",
          borderRadius: "4px",
          ...(type === "success" && {
            backgroundColor: Palette.success.bg.light,
            color: Palette.success.dark,
          }),
          ...(type === "warning" && {
            backgroundColor: Palette.secondary.bg.light,
            color: Palette.secondary.dark,
          }),
          ...(type === "error" && {
            backgroundColor: Palette.error.bg.light,
            color: Palette.error.dark,
          }),
          ...(type === "info" && {
            color: Palette.primary.main,
            backgroundColor: Palette.primary.bg.light,
          }),
          ...(Boolean(HelpText) && {
            flexDirection: "column",
            gap: "8px",
          }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "16px",
            width: "100%",
            alignItems: "center",
          }}
        >
          {iconVariant[type]}{" "}
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "32px",
              letterSpacing: "-0.4px",
            }}
          >
            {message}
          </Typography>
          <IconButton
            onClick={handleDismiss}
            sx={{ width: "2.5rem", height: "2.5rem", padding: "8px" }}
            disableRipple
          >
            <CloseIconComponent />
          </IconButton>
        </Box>
        {(HelpText || actions) && (
          <Box
            sx={{
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "24px",
              letterSpacing: "-0.32px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {helpTextComponent}
            {actions && actions.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "16px",
                  gap: "1rem",
                }}
              >
                {actions?.map((action) => (
                  <Button
                    variant="outlined"
                    color={action.color}
                    onClick={() => {
                      handleDismiss();
                      action.callback();
                    }}
                    sx={{ bgcolor: "inherit" }}
                    key={action.label}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}
      </SnackbarContent>
    );
  }
);

ETNotification.displayName = "ETNotification";

export default ETNotification;
