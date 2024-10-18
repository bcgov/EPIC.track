import React, { FC, useEffect } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  IconButton,
} from "@mui/material";
import { Palette } from "../../styles/theme";
import { IconProps } from "../icons/type";
import Icons from "../icons";
import { ETHeading4, ETSubhead } from ".";

export type TrackDialogProps = {
  onCancel?: () => void;
  onOk?: (args: any) => void;
  cancelButtonText?: string;
  okButtonText?: string;
  dialogTitle: string;
  dialogContentText?: string;
  isActionsRequired?: boolean;
  isOkRequired?: boolean;
  isCancelRequired?: boolean;
  additionalActions?: React.ReactNode;
  formId?: string;
  externalSubmitButtonUsed?: boolean;
  saveButtonProps?: ButtonProps;
} & DialogProps;

const CloseIconComponent: React.FC<IconProps> = Icons["NotificationClose"];

const TrackDialog: FC<TrackDialogProps> = ({
  onCancel,
  onOk,
  cancelButtonText,
  okButtonText,
  isActionsRequired,
  isOkRequired = true,
  isCancelRequired = true,
  open,
  dialogTitle,
  dialogContentText,
  formId,
  additionalActions,
  externalSubmitButtonUsed = false,
  saveButtonProps,
  ...props
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  useEffect(() => {
    setOpenDialog(open);
  }, [open]);

  if (!onOk) {
    onOk = () => setOpenDialog(false);
  }
  if (!onCancel) {
    onCancel = () => setOpenDialog(false);
  }

  return (
    <Dialog
      open={openDialog}
      {...props}
      PaperProps={{
        sx: {
          maxHeight: "80vh",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "24px 24px 16px 40px",
          flexDirection: "column",
          alignItems: "flex-end",
          alignSelf: "stretch",
          borderRadius: "4px 4px 0 0",
          borderBottom: `2px solid ${Palette.primary.main}`,
        }}
        className="modal-header"
      >
        <IconButton
          autoFocus
          onClick={onCancel}
          sx={{ width: "1.5rem", height: "1.5rem", padding: "0" }}
          disableRipple
        >
          <CloseIconComponent />
        </IconButton>
        <ETHeading4 bold sx={{ color: Palette.primary.main, width: "100%" }}>
          {dialogTitle}
        </ETHeading4>
      </Box>
      <DialogContent
        sx={{
          padding: "24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "flex-start",
          alignSelf: "stretch",
          // overflowY: "auto",
          backgroundColor: Palette.neutral.bg.light,
        }}
      >
        {dialogContentText && (
          <DialogContentText
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
          </DialogContentText>
        )}
        {props.children}
      </DialogContent>
      {isActionsRequired && (
        <DialogActions
          sx={{
            padding: "16px 40px 24px 40px",
            borderRadius: "0 0 4px 4px",
            borderTop: `1px solid ${Palette.neutral.bg.dark}`,
          }}
        >
          {additionalActions}
          {isCancelRequired && (
            <Button
              size="large"
              onClick={onCancel}
              variant="outlined"
              sx={{
                minWidth: "124px",
                marginRight: externalSubmitButtonUsed ? "140px" : "",
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
                minWidth: "124px",
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
              size="large"
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
    </Dialog>
  );
};

export default TrackDialog;
