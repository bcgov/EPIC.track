import { FC } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Palette } from "styles/theme";
import { TrackDialogProps } from ".";
import { ETCaption1, ETHeading4, ETSubhead } from "..";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";

const CloseIconComponent: React.FC<IconProps> = Icons["NotificationClose"];

type TrackDialogContentProps = Omit<TrackDialogProps, "open">;

const TrackDialogContent: FC<TrackDialogContentProps> = ({
  onCancel,
  onOk,
  cancelButtonText,
  okButtonText,
  isActionsRequired,
  isOkRequired = true,
  isCancelRequired = true,
  dialogTitle,
  dialogContentText,
  formId,
  additionalActions,
  externalSubmitButtonUsed = false,
  saveButtonProps,
  subHeading = "",
  heading = "",
  dialogTitleIcon = undefined,
  children,
  variant = "default",
  headingBackgroundColor = "",
}) => {
  const isCompact = variant === "compact";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxHeight: "100vh",
        backgroundColor: Palette.neutral.bg.light,
        border: `1px solid ${Palette.neutral.bg.dark}`,
        borderRadius: "4px",
        ...(isCompact && {
          maxHeight: "100%",
          borderRadius: "2px",
        }),
      }}
    >
      {!isCompact && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            pt: "1rem",
            pr: "1rem",
          }}
        >
          <IconButton
            onClick={onCancel}
            sx={{
              width: isCompact ? "1.2rem" : "1.5rem",
              height: isCompact ? "1.2rem" : "1.5rem",
              padding: "0",
              gridColumn: 2,
              gridRow: 1,
              alignSelf: "end",
            }}
            disableRipple
          >
            <CloseIconComponent />
          </IconButton>
        </Box>
      )}
      <DialogTitle
        className="modal-header"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          padding: isCompact ? "12px 16px" : "0px 40px 24px 40px",
          borderBottom: `2px solid ${Palette.primary.main}`,
          borderRadius: "4px 4px 0 0",
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns="1fr auto"
          gridTemplateRows="auto"
          gap={1}
          sx={{
            alignItems: "center",
            backgroundColor: headingBackgroundColor ?? "inherit",
            border: headingBackgroundColor
              ? `2px solid ${Palette.neutral.accent.light};`
              : "none",
            borderRadius: "4px",
            width: "100%",
            padding: isCompact ? "0.5rem 0.875rem" : "0rem",
          }}
        >
          {heading && (
            <Tooltip sx={{ gridColumn: 1 }} title={heading ?? ""}>
              <span>
                <ETCaption1
                  sx={{
                    color: headingBackgroundColor
                      ? Palette.neutral.dark
                      : Palette.neutral.light,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    padding: heading ? "0" : "0 0.5rem 0.5rem 0",
                    fontSize: "1rem",
                    mb: subHeading ? "0.25rem" : 0,
                  }}
                >
                  {heading}
                </ETCaption1>
              </span>
            </Tooltip>
          )}
          {subHeading && (
            <Tooltip sx={{ gridColumn: 1 }} title={subHeading ?? ""}>
              <span>
                <ETCaption1
                  bold
                  sx={{
                    color: headingBackgroundColor
                      ? Palette.neutral.dark
                      : Palette.neutral.light,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    textTransform: "uppercase",
                    padding: heading ? "0" : "0 0.5rem 0.5rem 0",
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                  }}
                >
                  {subHeading}
                </ETCaption1>
              </span>
            </Tooltip>
          )}
          {isCompact && (
            <IconButton
              onClick={onCancel}
              sx={{
                width: isCompact ? "1.2rem" : "1.5rem",
                height: isCompact ? "1.2rem" : "1.5rem",
                padding: "0",
                gridColumn: 2,
                gridRow: 1,
                alignSelf: heading || subHeading ? "start" : "center",
              }}
              disableRipple
            >
              <CloseIconComponent />
            </IconButton>
          )}
          <ETHeading4
            bold
            sx={{
              color: Palette.primary.main,
              width: "100%",
              gridColumn: subHeading ? 1 : "1 / span 2",
              alignSelf: heading && subHeading ? "start" : "center",
              fontSize: heading ? "0.875rem" : "1.25rem",
              mt: heading && subHeading ? "-0.5rem" : 0,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5} fontWeight={700}>
              {dialogTitleIcon && (
                <Box
                  sx={{
                    width: "1rem",
                    height: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {dialogTitleIcon}
                </Box>
              )}
              <Tooltip title={dialogTitle ?? ""}>
                <span>
                  <Box
                    sx={{
                      color: Palette.primary.main,
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 1,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {dialogTitle}
                  </Box>
                </span>
              </Tooltip>
            </Box>
          </ETHeading4>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: isCompact ? "10px 16px" : "20px 40px",
          "&.MuiDialogContent-root": {
            paddingTop: isCompact ? "8px !important" : "16px !important",
          },
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "flex-start",
          backgroundColor: Palette.neutral.bg.light,
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {dialogContentText && (
          <Box sx={{ color: Palette.neutral.dark }}>
            <ETSubhead sx={{ lineHeight: "1.6rem" }}>
              {dialogContentText}
            </ETSubhead>
          </Box>
        )}
        {children}
      </DialogContent>
      {isActionsRequired && (
        <DialogActions
          sx={{
            padding: isCompact ? "8px 16px 12px 16px" : "16px 40px 24px 40px",
            borderRadius: "0 0 4px 4px",
            borderTop: `1px solid ${Palette.neutral.bg.dark}`,
          }}
        >
          {additionalActions}
          {isCancelRequired && (
            <Button
              size={isCompact ? "small" : "large"}
              onClick={onCancel}
              variant="outlined"
              sx={{
                minWidth: isCompact ? "80px" : "124px",
                maxHeight: isCompact ? "45px" : "unset",
                marginRight: externalSubmitButtonUsed
                  ? isCompact
                    ? "80px"
                    : "140px"
                  : "",
                "&:focus": {
                  backgroundColor: Palette.primary.main,
                  color: Palette.neutral.bg.light,
                },
              }}
            >
              {cancelButtonText || "Cancel"}
            </Button>
          )}
          {isOkRequired && (
            <Button
              sx={{
                minWidth: isCompact ? "80px" : "124px",
                maxHeight: isCompact ? "45px" : "unset",
                "&:focus": {
                  backgroundColor: Palette.primary.light,
                },
              }}
              onClick={(event: React.MouseEvent) => {
                const isFocused =
                  event?.currentTarget === document?.activeElement;
                if (!isFocused) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                return formId ? undefined : onOk?.(null);
              }}
              size={isCompact ? "small" : "large"}
              type={formId ? "submit" : "button"}
              form={formId}
              variant="contained"
              {...saveButtonProps}
            >
              {okButtonText || "Ok"}
            </Button>
          )}
        </DialogActions>
      )}
    </Box>
  );
};

export default TrackDialogContent;
