import React from "react";
import { IMaskInput } from "react-imask";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import ControlledTextField from "../controlledInputComponents/ControlledTextField";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<
  HTMLInputElement,
  CustomProps & { mask: string }
>(function TextMaskCustom(props, ref) {
  const { onChange, mask, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={mask}
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value: any) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  );
});

export const MaskTextField = (props: TextFieldProps) => {
  return (
    <TextField
      InputProps={{
        inputComponent: TextMaskCustom as any,
      }}
      {...props}
    />
  );
};

type ControlledMaskTextFieldProps = TextFieldProps & {
  name: string;
  mask: string;
};

export const ControlledMaskTextField = ({
  name,
  mask,
  ...otherProps
}: ControlledMaskTextFieldProps) => {
  return (
    <ControlledTextField
      name={name}
      InputProps={{
        inputComponent: (props: any) => (
          <TextMaskCustom {...props} mask={mask} />
        ),
      }}
      {...otherProps}
    />
  );
};
