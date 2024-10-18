import React from "react";
import { useFormContext } from "react-hook-form";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import { Grid, TextField } from "@mui/material";

const PCPInput = () => {
  const {
    register,
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
