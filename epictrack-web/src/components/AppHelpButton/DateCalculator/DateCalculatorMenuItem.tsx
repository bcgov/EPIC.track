import { useState } from "react";
import { HelpMenuItem } from "../HelpMenuItem";
import TrackDialog from "components/shared/TrackDialog";
import { DateCalculatorForm } from "./DateCalculatorForm";
import { styled } from "@mui/material/styles";

// Create a styled TrackDialog specifically for the Date Calculator to position it
const StyledDateCalculatorDialog = styled(TrackDialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    // Target the underlying Dialog's paper
    position: "absolute",
    bottom: "20px",
    right: "20px",
    top: "auto",
    left: "auto",
    transform: "none",
  },
}));

export const DateCalculatorMenuItem = () => {
  const [open, setOpen] = useState<boolean>(false);

  const openModal = () => {
    setOpen(true);
  };

  return (
    <>
      <HelpMenuItem onClick={openModal}>Date Calculator</HelpMenuItem>
      <StyledDateCalculatorDialog
        open={open}
        dialogTitle="Date Calculator"
        disableEscapeKeyDown
        fullWidth
        maxWidth="lg"
        onCancel={() => setOpen(false)}
      >
        <DateCalculatorForm />
      </StyledDateCalculatorDialog>
    </>
  );
};
