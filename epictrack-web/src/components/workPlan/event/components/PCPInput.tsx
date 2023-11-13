import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Moment from "moment";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import { Grid, TextField } from "@mui/material";
import { DATE_FORMAT } from "../../../../constants/application-constant";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

interface PCPInputProps {
  isFormFieldsLocked: boolean;
}
const PCPInput = ({ isFormFieldsLocked }: PCPInputProps) => {
  const {
    register,
    unregister,
    control,
    formState: { errors },
  } = useFormContext();
  const [topicCount, setTopicCount] = React.useState<number>(0);
  const topicChangeHandler = (event: any) => {
    setTopicCount(event.target.value.length);
  };
  return (
    <>
      <Grid item xs={6}>
        <ETFormLabel>Number of Responses</ETFormLabel>
        <TextField
          fullWidth
          disabled={isFormFieldsLocked}
          helperText={errors?.number_of_responses?.message?.toString()}
          error={!!errors?.number_of_responses?.message}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
          type="number"
          {...register("number_of_responses")}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabelWithCharacterLimit
          characterCount={topicCount}
          maxCharacterLength={150}
        >
          Topic
        </ETFormLabelWithCharacterLimit>
        <TextField
          fullWidth
          disabled={isFormFieldsLocked}
          helperText={errors?.topic?.message?.toString()}
          error={!!errors?.topic?.message}
          InputProps={{
            inputProps: {
              maxLength: 150,
            },
          }}
          {...register("topic")}
          onChange={topicChangeHandler}
        />
      </Grid>
    </>
  );
};

export default PCPInput;
