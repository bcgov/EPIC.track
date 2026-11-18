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

const TrackDialog: FC<TrackDialogProps> = ({
  open,
  onCancel,
  onOk,
  cancelButtonText,
  okButtonText,
  dialogTitle,
  dialogContentText,
  isActionsRequired,
  isOkRequired,
  isCancelRequired,
  additionalActions,
  formId,
  externalSubmitButtonUsed,
  saveButtonProps,
  subHeading,
  heading,
  variant,
  dialogTitleIcon,
  headingBackgroundColor,
  children,
  ...dialogProps
}) => {
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setOpenDialog(open);
  }, [open]);

  // MUI's Dialog passes unknown props to a DOM div, so only its own go there.
  return (
    <Dialog
      open={openDialog}
      PaperProps={{ sx: { maxHeight: "80vh" } }}
      {...dialogProps}
    >
      <TrackDialogContent
        onCancel={onCancel}
        onOk={onOk}
        cancelButtonText={cancelButtonText}
        okButtonText={okButtonText}
        dialogTitle={dialogTitle}
        dialogContentText={dialogContentText}
        isActionsRequired={isActionsRequired}
        isOkRequired={isOkRequired}
        isCancelRequired={isCancelRequired}
        additionalActions={additionalActions}
        formId={formId}
        externalSubmitButtonUsed={externalSubmitButtonUsed}
        saveButtonProps={saveButtonProps}
        subHeading={subHeading}
        heading={heading}
        variant={variant}
        dialogTitleIcon={dialogTitleIcon}
        headingBackgroundColor={headingBackgroundColor}
      >
        {children}
      </TrackDialogContent>
    </Dialog>
  );
};

export default TrackDialog;
