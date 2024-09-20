import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, FormControlLabel, Grid, Stack, Tooltip } from "@mui/material";
import ControlledTextField from "../../../shared/controlledInputComponents/ControlledTextField";
import {
  ETFormLabel,
  ETFormLabelWithCharacterLimit,
  ETParagraph,
} from "../../../shared";
import ControlledSwitch from "../../../shared/controlledInputComponents/ControlledSwitch";
import { IssuesContext } from "../IssuesContext";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { CreateIssueForm } from "../types";
import moment from "moment";
import ControlledDatePicker from "../../../shared/controlledInputComponents/ControlledDatePicker";
import { descriptionCharacterLimit } from "./constants";

const InfoIcon: React.FC<IconProps> = Icons["InfoIcon"];

const CreateIssue = () => {
  const { setCreateIssueFormIsOpen, addIssue } =
    React.useContext(IssuesContext);

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup
      .string()
      .required("Description is required")
      .max(descriptionCharacterLimit),
    is_active: yup.boolean(),
    is_high_priority: yup.boolean(),
    start_date: yup.string().required("Start date is required"),
    expected_resolution_date: yup.string().nullable(),
  });

  const methods = useForm<CreateIssueForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      is_active: true,
      is_high_priority: false,
      start_date: "",
      expected_resolution_date: "",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch } = methods;

  const watchedTitle = watch("title");
  const titleCharacterLimit = 50;
  const watchedDescription = watch("description");

  const onSubmitHandler = async (data: CreateIssueForm) => {
    const {
      title,
      description,
      start_date,
      expected_resolution_date,
      is_active,
      is_high_priority,
    } = await schema.validate(data);

    const dataToBeSubmitted = {
      title,
      description,
      start_date: moment(start_date).format(),
      expected_resolution_date: expected_resolution_date
        ? moment(expected_resolution_date).format()
        : undefined,
      is_active: Boolean(is_active),
      is_high_priority: Boolean(is_high_priority),
    };

    addIssue(dataToBeSubmitted);
    setCreateIssueFormIsOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="issue-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={watchedTitle.length}
            maxCharacterLength={titleCharacterLimit}
            required
          >
            Title
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="title"
            fullWidth
            size="small"
            inputProps={{
              maxLength: titleCharacterLimit,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={watchedDescription.length}
            maxCharacterLength={descriptionCharacterLimit}
            required
          >
            Description
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="description"
            fullWidth
            size="small"
            minRows={4}
            inputProps={{
              maxLength: descriptionCharacterLimit,
            }}
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={<ControlledSwitch name="is_active" />}
              label={
                <Stack direction="row" spacing={1}>
                  <ETParagraph>Active</ETParagraph>
                  <Tooltip title="Issue must be active to appear on reports">
                    <Box component={"span"}>
                      <InfoIcon />
                    </Box>
                  </Tooltip>
                </Stack>
              }
            />
            <FormControlLabel
              control={<ControlledSwitch name="is_high_priority" />}
              label={
                <Stack direction="row" spacing={1}>
                  <ETParagraph>High Priority</ETParagraph>
                  <Tooltip title="Issue must be High Priority to appear on 30-60-90">
                    <Box component={"span"}>
                      <InfoIcon />
                    </Box>
                  </Tooltip>
                </Stack>
              }
            />
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Start Date</ETFormLabel>
          <ControlledDatePicker name="start_date" />
        </Grid>
        <Grid item xs={6}>
          <ETParagraph bold>Expected Resolution Date</ETParagraph>
          <ControlledDatePicker name="expected_resolution_date" />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default CreateIssue;
