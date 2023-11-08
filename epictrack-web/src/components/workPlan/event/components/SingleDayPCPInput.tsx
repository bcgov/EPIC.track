import React from "react";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import { Grid, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";

interface SingleDayPCPInputProps {
  isFormFieldsLocked: boolean;
}
const SingleDayPCPInput = ({ isFormFieldsLocked }: SingleDayPCPInputProps) => {
  const {
    register,
    unregister,
    formState: { errors },
  } = useFormContext();
  React.useEffect(() => {
    return () => {
      // unregister("number_of_attendees");
    };
  }, []);
  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel>Number of Attendees</ETFormLabel>
        <TextField
          fullWidth
          disabled={isFormFieldsLocked}
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
