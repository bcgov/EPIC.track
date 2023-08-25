import React, { FC, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  IconButton,
  SxProps,
} from "@mui/material";
import { Palette } from "../../styles/theme";
import { IconProps } from "../icons/type";
import Icons from "../icons";
import { ETHeading3, ETSubhead } from ".";

type TrackDialogProps = {
  onCancel?: () => void;
  onOk?: (args: any) => void;
  cancelButtonText?: string;
  okButtonText?: string;
  dialogTitle: string;
  dialogContentText?: string;
  isActionsRequired?: boolean;
  isOkRequired?: boolean;
  isCancelRequired?: boolean;
  formId?: string;
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
          onClick={onCancel}
          sx={{ width: "1.5rem", height: "1.5rem", padding: "0" }}
          disableRipple
        >
          <CloseIconComponent />
        </IconButton>
        <ETHeading3 bold sx={{ color: Palette.primary.main, width: "100%" }}>
          {dialogTitle}
        </ETHeading3>
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
        }}
      >
        {dialogContentText && (
          <DialogContentText
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            <ETSubhead>{dialogContentText}</ETSubhead>
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
          {isCancelRequired && (
            <Button size="large" onClick={onCancel} variant="outlined">
              {cancelButtonText || "Cancel"}
            </Button>
          )}
          {isOkRequired && (
            <Button
              onClick={formId ? undefined : onOk}
              autoFocus
              size="large"
              type={formId ? "submit" : "button"}
              form={formId}
              variant="contained"
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
