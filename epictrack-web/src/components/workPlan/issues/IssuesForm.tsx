import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Grid, Stack } from "@mui/material";
import { Status } from "../../../models/status";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";
import { ETParagraph } from "../../shared";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";

const schema = yup.object().shape({
  tile: yup.string().required(),
  description: yup.string().required(),
  active: yup.boolean(),
  high_priority: yup.boolean(),
  start_date: yup.date().required(),
  expected_resolution_date: yup.date(),
});

const IssuesForm = () => {
  const methods = useForm<Status>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const onSubmitHandler = async (data: Status) => {
    console.log(data);
    return null;
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="status-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={12}>
          <ETParagraph bold>Title</ETParagraph>
          <ControlledTextField
            name="title"
            label=" "
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <ETParagraph bold>Description</ETParagraph>
          <ControlledTextField
            name="description"
            label=" "
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <ControlledSwitch name="active" />
            <ControlledSwitch name="high_priority" />
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <ETParagraph bold>Start Date</ETParagraph>
          <ControlledTextField
            name="start_date"
            label=" "
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <ETParagraph bold>Expected Resolution Date</ETParagraph>
          <ControlledTextField
            name="expected_resolution_date"
            label=" "
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} container justifyContent={"flex-end"}>
          <Stack>
            <Button variant="outlined">Cancel</Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default IssuesForm;
