import { useState } from "react";
import { HelpMenuItem } from "../HelpMenuItem";
import TrackDialog from "components/shared/TrackDialog";
import { DateCalculatorForm } from "./DateCalculatorForm";

export const DateCalculatorMenuItem = () => {
  const [open, setOpen] = useState<boolean>(false);

  const openModal = () => {
    setOpen(true);
  };

  return (
    <>
      <HelpMenuItem onClick={openModal}>Date Calculator</HelpMenuItem>
      <TrackDialog
        open={open}
        dialogTitle="Date Calculator"
        disableEscapeKeyDown
        fullWidth
        maxWidth="lg"
        onCancel={() => setOpen(false)}
      >
        <DateCalculatorForm />
      </TrackDialog>
    </>
  );
};
