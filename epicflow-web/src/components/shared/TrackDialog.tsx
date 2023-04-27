import React, { useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogProps, DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';

type TrackDialogProps = {
  onCancel?: () => void,
  onOk?: () => void,
  cancelButtonText?: string,
  okButtonText?: string,
  dialogTitle: string,
  dialogContentText?: string,
  isActionsRequired: boolean,
  isOkRequired: boolean,
  isCancelRequired: boolean
} & DialogProps;

const TrackDialog = ({ open, dialogTitle, ...props }: TrackDialogProps) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  useEffect(()=>{
    setOpenDialog(open);
  },[open]);
  console.log(openDialog);
  if (!props.onOk) {
    props.onOk = () => setOpenDialog(false);
  }
  if (!props.onCancel) {
    props.onCancel = () => setOpenDialog(false);
  }
  return (
    <Dialog
      open={openDialog}
      {...props}
    >
      <DialogTitle>
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        {props.dialogContentText && <DialogContentText>
          {props.dialogContentText}
        </DialogContentText>}
        {props.children}
      </DialogContent>
      {props.isActionsRequired && <DialogActions>
        {props.isCancelRequired && <Button onClick={props.onCancel}>{props.cancelButtonText}</Button>}
        {props.isOkRequired && <Button onClick={props.onOk} autoFocus>
          {props.okButtonText}
        </Button>}
      </DialogActions>}
    </Dialog>
  )
}

TrackDialog.propTypes = {
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  okButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  dialogTitle: PropTypes.string.isRequired,
  dialogContentText: PropTypes.string,
  isActionsRequried: PropTypes.bool,
  isOkRequired: PropTypes.bool,
  isCancelRequired: PropTypes.bool
}

TrackDialog.defaultProps = {
  okButtonText: 'Ok',
  cancelButtonText: 'Cancel',
  isActionsRequired: false,
  isOkRequired: true,
  isCancelRequired: true
}

export default TrackDialog;