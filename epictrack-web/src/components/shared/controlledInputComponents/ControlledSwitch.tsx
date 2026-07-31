import React from "react";
import { CheckboxProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { CustomSwitch } from "../CustomSwitch";
import * as tokens from "../../../styles/designTokens";

type IFormSwitchProps = {
  name: string;
} & CheckboxProps;

const ControlledSwitch: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IFormSwitchProps
> = ({ name, sx, ...otherProps }, ref) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  const hasError = !!errors[name];

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || false}
      render={({ field }) => (
        <CustomSwitch
          sx={{
            marginLeft: "10px",
            marginRight: "10px",
            ...(hasError && {
              "& .MuiSwitch-track": {
                border: `2px solid ${tokens.supportBorderColorDanger}`,
              },
            }),
            ...sx,
          }}
          {...otherProps}
          {...field}
          ref={ref}
          disabled={otherProps.disabled}
          checked={field.value || (otherProps.defaultChecked ?? false)}
        />
      )}
    />
  );
};

export default React.forwardRef(ControlledSwitch);
