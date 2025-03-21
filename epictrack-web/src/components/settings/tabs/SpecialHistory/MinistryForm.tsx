import { useContext, useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { ETFormLabel } from "components/shared";
import ControlledDatePicker from "components/shared/controlledInputComponents/ControlledDatePicker";
import ControlledTextField from "components/shared/controlledInputComponents/ControlledTextField";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { SpecialHistoryContext } from "./SpecialHistorySettingsContext";
import ControlledSelectV2 from "components/shared/controlledInputComponents/ControlledSelectV2";
import { Staff } from "models/staff";
import { WorkFormSpecialField } from "components/work/WorkForm/WorkFormSpecialField";
import {
  SPECIAL_FIELD_TYPES,
  SpecialFieldEntityEnum,
} from "constants/application-constant";

const schema = yup.object().shape({
  name: yup.string().required("Ministry is required"),
  minister_id: yup.string().required("Minister is required"),
  abbreviation: yup.string().required("Abbreviation is required"),
  date_created: yup.string().required("Date Created is required"),
  date_closed: yup.string().nullable(),
});

type MinistryFormProps = {
  setDisableDialogSave?: (disable: boolean) => void;
};

const MinistryForm = ({ setDisableDialogSave }: MinistryFormProps) => {
  const {
    onSave,
    ministers,
    ministry,
    getMinistries,
    ministries,
    setMinistry,
  } = useContext(SpecialHistoryContext);

  const [isAbbreviationUnLocked, setIsAbbreviationUnLocked] = useState(false);
  const [isMinisterUnLocked, setIsMinisterUnLocked] = useState(false);
  const [isMinistryUnlocked, setIsMinistryUnlocked] = useState(false);

  const isSpecialFieldUnlocked: boolean =
    isAbbreviationUnLocked || isMinisterUnLocked || isMinistryUnlocked;

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      abbreviation: "",
      minister_id: "",
      date_created: "",
    },
  });

  const { handleSubmit, reset, register } = methods;

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
    });
  };

  useEffect(() => {
    reset(ministry);
  }, [reset, ministry]);

  useEffect(() => {
    if (setDisableDialogSave) {
      setDisableDialogSave(isSpecialFieldUnlocked);
    }
  }, [setDisableDialogSave, isSpecialFieldUnlocked]);

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="ministry-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <WorkFormSpecialField
          id={ministry?.id}
          onLockClick={() => setIsMinistryUnlocked((prev) => !prev)}
          open={isMinistryUnlocked}
          onSave={getMinistries}
          entity={SpecialFieldEntityEnum.MINISTRY}
          disabled={isAbbreviationUnLocked || isMinisterUnLocked}
          fieldLabel="Ministry"
          fieldName="name"
          fieldValueType={SPECIAL_FIELD_TYPES.STRING}
          fieldType="text"
          options={[]}
          gridSize={4}
          isPositionLeft={true}
        >
          <ControlledTextField
            name="name"
            fullWidth
            size="small"
            disabled={ministry !== null}
          />
        </WorkFormSpecialField>
        <WorkFormSpecialField
          id={ministry?.id}
          onLockClick={() => setIsAbbreviationUnLocked((prev) => !prev)}
          open={isAbbreviationUnLocked}
          onSave={getMinistries}
          entity={SpecialFieldEntityEnum.MINISTRY}
          disabled={isMinisterUnLocked || isMinistryUnlocked}
          fieldLabel="Abbreviation"
          fieldName="abbreviation"
          fieldValueType={SPECIAL_FIELD_TYPES.STRING}
          fieldType="text"
          options={[]}
          gridSize={4}
          isPositionLeft={true}
        >
          <ControlledTextField
            name="abbreviation"
            fullWidth
            size="small"
            disabled={ministry !== null}
          />
        </WorkFormSpecialField>
        <WorkFormSpecialField
          id={ministry?.id}
          onLockClick={() => setIsMinisterUnLocked((prev) => !prev)}
          open={isMinisterUnLocked}
          onSave={getMinistries}
          entity={SpecialFieldEntityEnum.MINISTRY}
          disabled={isAbbreviationUnLocked || isMinistryUnlocked}
          fieldLabel="Minister"
          fieldName="minister_id"
          fieldValueType={SPECIAL_FIELD_TYPES.INTEGER}
          fieldType="select"
          options={ministers || []}
          gridSize={4}
        >
          <ControlledSelectV2
            placeholder="Select a Minister"
            disabled={ministry !== null}
            getOptionLabel={(o: Staff) => (o ? o.full_name : "")}
            getOptionValue={(o: Staff) => (o ? o.id.toString() : "")}
            options={ministers || []}
            {...register("minister_id")}
          />
        </WorkFormSpecialField>
        <Grid item xs={6} sx={{ order: 1 }}>
          <ETFormLabel required>Date Created</ETFormLabel>
          <ControlledDatePicker name="date_created" />
        </Grid>
        <Grid item xs={6} sx={{ order: 1 }}>
          <ETFormLabel>Date Closed</ETFormLabel>
          <ControlledDatePicker name="date_closed" />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default MinistryForm;
