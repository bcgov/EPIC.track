import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import ControlledTextField from "../../../shared/controlledInputComponents/ControlledTextField";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import { IssuesContext } from "../IssuesContext";
import { CloneForm } from "../types";
import ControlledDatePicker from "components/shared/controlledInputComponents/ControlledDatePicker";
import dayjs from "dayjs";
import { descriptionCharacterLimit } from "./constants";
import { WorkplanContext } from "components/workPlan/WorkPlanContext";

const schema = yup.object().shape({
  posted_date: yup.string().required("Date is required"),
  description: yup.string().required("Description is required"),
});

const NewIssueUpdate = () => {
  const {
    setNewIssueUpdateFormIsOpen,
    setUpdateToClone,
    updateToClone,
    cloneIssueUpdate,
  } = React.useContext(IssuesContext);

  const minPostedDate = updateToClone?.posted_date
    ? dayjs(updateToClone.posted_date).add(1, "day").format().toString()
    : "";

  const methods = useForm<CloneForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      posted_date: minPostedDate,
      description: updateToClone?.description || "",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch } = methods;

  const watchedDescription = watch("description");

  const onSubmitHandler = async (data: CloneForm) => {
    const validData = await schema.validate(data);

    cloneIssueUpdate(validData);

    setNewIssueUpdateFormIsOpen(false);
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
                minDate: minPostedDate ? dayjs(minPostedDate) : undefined,
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={watchedDescription.length}
            maxCharacterLength={descriptionCharacterLimit}
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

export default NewIssueUpdate;
