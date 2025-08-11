import { FC } from "react";
import {
  Box,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
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
  headingCaption = "",
  children,
  variant = "default",
}) => {
  const isCompact = variant === "compact";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
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
      <Box
        className="modal-header"
        sx={{
          display: "flex",
          padding: isCompact ? "12px 16px 8px 20px" : "24px 24px 16px 40px",
          flexDirection: "column",
          alignItems: "flex-end",
          alignSelf: "stretch",
          borderRadius: "4px 4px 0 0",
          borderBottom: `2px solid ${Palette.primary.main}`,
        }}
      >
        <Box
          justifyContent={"space-between"}
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          <Tooltip title={headingCaption ?? ""}>
            <span>
              <ETCaption1
                bold
                sx={{
                  color: Palette.neutral.light,
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  padding: "0 0.5rem 0.5rem 0",
                }}
              >
                {headingCaption}
              </ETCaption1>
            </span>
          </Tooltip>
          <IconButton
            onClick={onCancel}
            sx={{
              width: isCompact ? "1.2rem" : "1.5rem",
              height: isCompact ? "1.2rem" : "1.5rem",
              padding: "0",
            }}
            disableRipple
          >
            <CloseIconComponent />
          </IconButton>
        </Box>
        <ETHeading4 bold sx={{ color: Palette.primary.main, width: "100%" }}>
          {dialogTitle}
        </ETHeading4>
      </Box>
      <DialogContent
        sx={{
          padding: isCompact ? "12px 16px" : "24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "flex-start",
          alignSelf: "stretch",
          backgroundColor: Palette.neutral.bg.light,
          flexGrow: isCompact ? 1 : 0,
          overflowY: isCompact ? "auto" : "visible",
          minHeight: 0,
        }}
      >
        {dialogContentText && (
          <Box
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            <ETSubhead
              sx={{
                lineHeight: "1.6rem",
              }}
            >
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
