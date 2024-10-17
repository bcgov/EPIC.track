import React from "react";
import { useFormContext } from "react-hook-form";
import { ETFormLabel } from "../../../shared";
import { Grid, TextField } from "@mui/material";

export interface MultiDaysInputProps {
  numberOfDaysRef: React.MutableRefObject<any>;
  endDateRef: React.MutableRefObject<any>;
  onChangeDay: () => void;
  isFormFieldsLocked: boolean;
}
const MultiDaysInput = ({
  endDateRef,
  numberOfDaysRef,
  onChangeDay,
  isFormFieldsLocked,
}: MultiDaysInputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  React.useEffect(() => {
    onChangeDay();
  }, []);
  return (
    <>
      <Grid item xs={6}>
        <ETFormLabel required>Number of Days</ETFormLabel>
        <TextField
          fullWidth
          disabled={isFormFieldsLocked}
          inputRef={numberOfDaysRef}
          helperText={errors?.number_of_days?.message?.toString()}
          error={!!errors?.number_of_days?.message}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
          type="number"
          {...register("number_of_days")}
          onChange={onChangeDay}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>End Date</ETFormLabel>
        <TextField
          fullWidth
          disabled
          placeholder="MM-DD-YYYY"
          inputRef={endDateRef}
        />
      </Grid>
    </>
  );
};

export default MultiDaysInput;
