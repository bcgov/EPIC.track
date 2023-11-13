import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";
import { ETFormLabelWithCharacterLimit } from "../../shared";
import { IssuesContext } from "./IssuesContext";
import { WorkplanContext } from "../WorkPlanContext";
import { CloneForm } from "./types";

const schema = yup.object().shape({
  description: yup.string().required("Description is required"),
});

const CloneUpdateForm = () => {
  const {
    setShowCloneForm,
    setUpdateToClone,
    updateToClone,
    cloneIssueUpdate,
  } = React.useContext(IssuesContext);

  const { issues } = React.useContext(WorkplanContext);

  const methods = useForm<CloneForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      description: "",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch, reset } = methods;

  const handleSetData = () => {
    if (!updateToClone) {
      return;
    }

    const issueToClone = issues.find(
      (issue) => issue.id === updateToClone.work_issue_id
    );

    if (!issueToClone) {
      return;
    }
    reset({
      description: updateToClone?.description,
    });
  };
  useEffect(() => {
    handleSetData();
  }, [updateToClone]);

  const watchedDescription = watch("description");
  const descriptionCharacterLimit = 250;

  const onSubmitHandler = async (data: CloneForm) => {
    const validData = await schema.validate(data);

    cloneIssueUpdate(validData);

    setShowCloneForm(false);
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
            inputProps={{
              maxLength: descriptionCharacterLimit,
            }}
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default CloneUpdateForm;
