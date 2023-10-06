import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Moment from "moment";
import { ETFormLabel } from "../../../shared";
import { Grid, TextField } from "@mui/material";
import { DATE_FORMAT } from "../../../../constants/application-constant";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

export interface MultiDaysInputProps {
  numberOfDaysRef: React.MutableRefObject<any>;
  endDateRef: React.MutableRefObject<any>;
  onChangeDay: () => void;
}
const MultiDaysInput = ({
  endDateRef,
  numberOfDaysRef,
  onChangeDay,
}: MultiDaysInputProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Grid item xs={6}>
        <ETFormLabel required>Number of Days</ETFormLabel>
        <TextField
          fullWidth
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
        <Controller
          name="anticipated_date"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disabled
                format={DATE_FORMAT}
                slotProps={{
                  textField: {
                    id: "anticipated_date",
                    fullWidth: true,
                    inputRef: endDateRef,
                    error: error ? true : false,
                    helperText: error?.message,
                    placeholder: "MM-DD-YYYY",
                  },
                }}
                value={dayjs(value)}
                onChange={(event) => {
                  onChange(event);
                }}
                sx={{ display: "block" }}
              />
            </LocalizationProvider>
          )}
        />
      </Grid>
    </>
  );
};

export default MultiDaysInput;
