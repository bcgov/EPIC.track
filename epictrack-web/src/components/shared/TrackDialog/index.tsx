import { FC, useEffect, useState } from "react";
import { ButtonProps, Dialog, DialogProps } from "@mui/material";
import TrackDialogContent from "./TrackDialogContent";

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
  subHeading?: string;
  heading?: string;
  variant?: "default" | "compact";
  dialogTitleIcon?: React.ReactNode;
  headingBackgroundColor?: string;
} & DialogProps;

const TrackDialog: FC<TrackDialogProps> = ({ open, ...props }) => {
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setOpenDialog(open);
  }, [open]);

  return (
    <Dialog
      open={openDialog}
      PaperProps={{ sx: { maxHeight: "80vh" } }}
      {...props}
    >
      <TrackDialogContent {...props} />
    </Dialog>
  );
};

export default TrackDialog;
