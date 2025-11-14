import { useContext, useEffect } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormControl, Grid } from "@mui/material";
import {
  ETCaption1,
  ETFormLabel,
  ETFormLabelWithCharacterLimit,
} from "components/shared";
import { OptionType } from "components/shared/filterSelect/type";
import ControlledTextField from "components/shared/controlledInputComponents/ControlledTextField";
import TrackSelect from "components/shared/TrackSelect";
import { WorkplanContext } from "components/workPlan/WorkPlanContext";
import {
  PhaseOverageResponsibility,
  OverageResponsibilityEnum,
} from "models/phaseOverageResponsibilities";
import { Palette } from "styles/theme";

const schema = yup.object().shape({
  responsibility: yup
    .array()
    .of(yup.string().oneOf(Object.values(OverageResponsibilityEnum)))
    .when(["isLegislated", "hasOverage"], {
      is: (isLegislated: boolean, hasOverage: boolean) =>
        isLegislated && hasOverage,
      then: (schema) =>
        schema.min(1, "At least one overage responsibility is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  notes: yup.string().max(2000, "Max 2000 characters"),
});

const CHARACTER_LIMIT = 2000;

interface OverageResponsibilityFormProps {
  onSave: (data: any, onSuccess: () => void) => void;
  daysTakenText?: string;
  overageResponsibilities: PhaseOverageResponsibility[];
  daysAhead: number;
  hasOverage: boolean;
  isRequired: boolean;
}

const OverageResponsibilityForm = ({
  onSave,
  daysTakenText,
  overageResponsibilities,
  hasOverage,
  isRequired,
}: OverageResponsibilityFormProps) => {
  const { selectedWorkPhase } = useContext(WorkplanContext);

  const responsibilityOptions: OptionType[] = Object.values(
    OverageResponsibilityEnum,
  ).map((val) => ({ value: val, label: val }));

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      responsibility:
        overageResponsibilities?.map((r) => r.responsibility) ?? [],
      notes: selectedWorkPhase?.work_phase.responsibility_notes ?? "",
      isRequired,
      hasOverage,
    },
    mode: "onBlur",
  });

  const { handleSubmit, reset, control } = methods;

  const notes = useWatch({ control, name: "notes" });

  useEffect(() => {
    if (selectedWorkPhase) {
      const values = {
        responsibility:
          overageResponsibilities?.map((r) => r.responsibility) ?? [],
        notes: selectedWorkPhase?.work_phase.responsibility_notes ?? "",
      };
      reset(values);
    }
  }, [reset, overageResponsibilities, selectedWorkPhase]);

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
    });
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component="form"
        id="overage-responsibility-form"
        spacing={2}
        padding={2}
        container
        sx={{ width: "100%" }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={6} sx={{ display: "flex", flexDirection: "column" }}>
          <ETFormLabel>Days</ETFormLabel>
          <ETCaption1
            sx={{
              fontSize: "1rem",
              color: Palette.error.dark,
              paddingTop: "0.5rem",
            }}
          >
            {selectedWorkPhase?.days_taken} /{" "}
            {selectedWorkPhase?.total_number_of_days} {daysTakenText}
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel required={isRequired && hasOverage}>
            Overage Responsibility
          </ETFormLabel>
          <FormControl sx={{ minWidth: 220, width: "100%" }}>
            <Controller
              name="responsibility"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TrackSelect
                    isMulti
                    options={responsibilityOptions}
                    value={responsibilityOptions.filter((option) =>
                      field.value?.includes(option.value),
                    )}
                    onChange={(selectedOptions) => {
                      const values = (selectedOptions as OptionType[]).map(
                        (opt) => opt.value,
                      );
                      field.onChange(values);
                    }}
                    isSearchable={false}
                  />
                  {fieldState.error && (
                    <ETCaption1 sx={{ color: "error.main" }}>
                      {fieldState.error.message}
                    </ETCaption1>
                  )}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={notes?.length ?? 0}
            maxCharacterLength={CHARACTER_LIMIT}
          >
            Notes
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="notes"
            multiline
            fullWidth
            minRows={4}
            inputProps={{
              maxLength: CHARACTER_LIMIT,
            }}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default OverageResponsibilityForm;
