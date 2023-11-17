import { TextField, TextFieldProps } from "@mui/material";
import { ComponentProps } from "react";
import { IMaskMixin } from "react-imask";
import ControlledTextField from "../controlledInputComponents/ControlledTextField";

const InternalMaskTextField = IMaskMixin((props) => (
  <TextField {...(props as any)} />
));

const InternalControlledMaskTextField = IMaskMixin((props) => (
  <ControlledTextField {...(props as any)} />
));

type MaskProps = ComponentProps<typeof InternalMaskTextField>;

export const MaskTextField = (props: TextFieldProps & MaskProps) => {
  return <InternalMaskTextField {...props} />;
};

export const ControlledMaskTextField = (props: TextFieldProps & MaskProps) => {
  return <InternalControlledMaskTextField {...props} />;
};
