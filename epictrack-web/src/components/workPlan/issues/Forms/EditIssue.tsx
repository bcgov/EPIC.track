import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, FormControlLabel, Grid, Stack, Tooltip } from "@mui/material";
import ControlledTextField from "../../../shared/controlledInputComponents/ControlledTextField";
import { ETFormLabelWithCharacterLimit, ETParagraph } from "../../../shared";
import ControlledSwitch from "../../../shared/controlledInputComponents/ControlledSwitch";
import { IssuesContext } from "../IssuesContext";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { EditIssueForm } from "../types";
import moment from "moment";
import ControlledDatePicker from "../../../shared/controlledInputComponents/ControlledDatePicker";
import { ETFormLabel } from "../../../shared";
import dayjs from "dayjs";

const InfoIcon: React.FC<IconProps> = Icons["InfoIcon"];

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  is_active: yup.boolean(),
  is_high_priority: yup.boolean(),
  start_date: yup.string().required("Start date is required"),
  expected_resolution_date: yup.string().nullable(),
});

const EditIssue = () => {
  const { editIssue, setUpdateToEdit, issueToEdit, setEditIssueFormIsOpen } =
    React.useContext(IssuesContext);

  const methods = useForm<EditIssueForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: issueToEdit?.title || "",
      is_active: Boolean(issueToEdit?.is_active),
      is_high_priority: Boolean(issueToEdit?.is_high_priority),
      start_date: issueToEdit?.start_date || "",
      expected_resolution_date: issueToEdit?.expected_resolution_date || "",
    },
    mode: "onSubmit",
  });

  const maxStartDate = useMemo(() => {
    if (!issueToEdit) {
      return undefined;
    }

    // find the min date of updates
    const updatesPostedDates = issueToEdit.updates.map((update) =>
      moment(update.posted_date)
    );
    const minPostedDate = moment.min(updatesPostedDates).toDate();
    return dayjs(minPostedDate);
  }, [issueToEdit]);

  const { handleSubmit, watch } = methods;

  const watchedTitle = watch("title");
  const titleCharacterLimit = 50;

  const onSubmitHandler = async (data: EditIssueForm) => {
    const {
      title,
      start_date,
      expected_resolution_date,
      is_active,
      is_high_priority,
    } = await schema.validate(data);

    const dataToBeSubmitted = {
      title,
      start_date: moment(start_date).format(),
      expected_resolution_date: expected_resolution_date
        ? moment(expected_resolution_date).format()
        : undefined,
      is_active: Boolean(is_active),
      is_high_priority: Boolean(is_high_priority),
    };

    editIssue(dataToBeSubmitted);
    setEditIssueFormIsOpen(false);
    setUpdateToEdit(null);
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
          <ControlledDatePicker
            name="start_date"
            datePickerProps={{
              maxDate: maxStartDate,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Expected Resolution Date</ETFormLabel>
          <ControlledDatePicker name="expected_resolution_date" />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default EditIssue;
