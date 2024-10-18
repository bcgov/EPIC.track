import React from "react";
import { ETFormLabel } from "../../../shared";
import { Grid, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";

const SingleDayPCPInput = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel>Number of Attendees</ETFormLabel>
        <TextField
          fullWidth
          helperText={errors?.number_of_attendees?.message?.toString()}
          error={!!errors?.number_of_attendees?.message}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
          type="number"
          {...register("number_of_attendees")}
        />
      </Grid>
    </>
  );
};

export default SingleDayPCPInput;
