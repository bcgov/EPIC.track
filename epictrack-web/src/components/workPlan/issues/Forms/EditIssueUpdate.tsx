import React, { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import ControlledTextField from "../../../shared/controlledInputComponents/ControlledTextField";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import { IssuesContext } from "../IssuesContext";
import { CloneForm } from "../types";
import { descriptionCharacterLimit } from "./constants";
import ControlledDatePicker from "components/shared/controlledInputComponents/ControlledDatePicker";
import { WorkplanContext } from "components/workPlan/WorkPlanContext";
import dayjs from "dayjs";

const schema = yup.object().shape({
  posted_date: yup.string().required("Date is required"),
  description: yup
    .string()
    .required("Description is required")
    .max(descriptionCharacterLimit),
});

const EditIssueUpdate = () => {
  const { issues } = React.useContext(WorkplanContext);
  const {
    setUpdateToClone,
    updateToEdit,
    editIssueUpdate,
    setEditIssueUpdateFormIsOpen,
  } = React.useContext(IssuesContext);

  const minPostedDate = useMemo(() => {
    const issue = issues.find(
      (issue) => issue.id === updateToEdit?.work_issue_id
    );
    if (!issue) return undefined;
    const approvedIssueUpdatesDates = issue?.updates
      .filter((update) => update.id !== updateToEdit?.id && update.is_approved)
      .map((update) => dayjs(update.posted_date).add(1, "day").unix());
    const minDateUnix = Math.max(
      ...approvedIssueUpdatesDates,
      dayjs(issue?.start_date).unix()
    );
    const minDate = dayjs(minDateUnix * 1000);
    return minDate;
  }, [issues, updateToEdit?.id]);

  const methods = useForm<CloneForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      posted_date: updateToEdit?.posted_date,
      description: updateToEdit?.description,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch } = methods;

  const watchedDescription = watch("description");

  const onSubmitHandler = async (data: CloneForm) => {
    const validData = await schema.validate(data);

    editIssueUpdate(validData);

    setEditIssueUpdateFormIsOpen(false);
    setUpdateToClone(null);
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
        <Grid item xs={12} container>
          <Grid item xs={6}>
            <ETFormLabel required>Date</ETFormLabel>
            <ControlledDatePicker
              name="posted_date"
              datePickerProps={{
                minDate: minPostedDate,
              }}
            />
          </Grid>
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
      </Grid>
    </FormProvider>
  );
};

export default EditIssueUpdate;
