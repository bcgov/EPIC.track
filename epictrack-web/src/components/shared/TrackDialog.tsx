import React, { FC, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import PropTypes from "prop-types";

type TrackDialogProps = {
  onCancel?: () => void;
  onOk?: () => void;
  cancelButtonText?: string;
  okButtonText?: string;
  dialogTitle: string;
  dialogContentText?: string;
  isActionsRequired?: boolean;
  isOkRequired?: boolean;
  isCancelRequired?: boolean;
} & DialogProps;

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
    <Dialog open={openDialog} {...props}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {dialogContentText && (
          <DialogContentText>{dialogContentText}</DialogContentText>
        )}
        {props.children}
      </DialogContent>
      {isActionsRequired && (
        <DialogActions>
          {isCancelRequired && (
            <Button onClick={onCancel}>{cancelButtonText || "Cancel"}</Button>
          )}
          {isOkRequired && (
            <Button onClick={onOk} autoFocus>
              {okButtonText || "Ok"}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

// TrackDialog.propTypes = {
//   onOk: PropTypes.func,
//   onCancel: PropTypes.func,
//   okButtonText: PropTypes.string,
//   cancelButtonText: PropTypes.string,
//   dialogTitle: PropTypes.string.isRequired,
//   dialogContentText: PropTypes.string,
//   isActionsRequried: PropTypes.bool,
//   isOkRequired: PropTypes.bool,
//   isCancelRequired: PropTypes.bool,
// };

// TrackDialog.defaultProps = {
//   // okButtonText: "Ok",
//   // cancelButtonText: "Cancel",
//   isActionsRequired: false,
//   isOkRequired: true,
//   isCancelRequired: true,
// };

export default TrackDialog;
