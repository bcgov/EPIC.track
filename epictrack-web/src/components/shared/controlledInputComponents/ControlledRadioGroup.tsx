import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { RadioOptions } from "../../../models/type";
import { Palette } from "../../../styles/theme";

type IFormRadioGroupProps = {
  name: string;
  options: RadioOptions[];
} & RadioGroupProps;

const ControlledRadioGroup: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IFormRadioGroupProps
> = ({ name, options, ...otherProps }, ref) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  const [selectedVal, setSelectedVal] = useState("");
  const generateRadioOptions = useCallback(() => {
    return options.map((singleOption) => (
      <FormControlLabel
        sx={{
          padding: "0.5rem 1rem 0.5rem 1rem ",
          ...(singleOption.value === Number(selectedVal) && {
            color: Palette.primary.accent.main,
          }),
        }}
        value={singleOption.value}
        label={singleOption.label}
        control={
          <Radio
            sx={{
              padding: 0,
              mr: "0.5rem",
            }}
          />
        }
      />
    ));
  }, [selectedVal]);
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues}
      render={({ field }) => (
        <FormControl error={!!errors[name]}>
          <RadioGroup
            {...field}
            onChange={(e) => {
              field.onChange(e);
              setSelectedVal(e.target.value);
            }}
          >
            {generateRadioOptions()}
          </RadioGroup>
          <FormHelperText>{String(errors[name]?.message || "")}</FormHelperText>
        </FormControl>
      )}
    />
  );
};

export default React.forwardRef(ControlledRadioGroup);
