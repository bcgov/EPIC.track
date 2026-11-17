import { useContext, useEffect, useState } from "react";
import { Grid, TextField } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import ControlledSelectV2 from "../../../shared/controlledInputComponents/ControlledSelectV2";
import { ListType } from "../../../../models/code";
import { useFormContext } from "react-hook-form";
import { eventsApi } from "api/events";
import { WorkplanContext } from "../../WorkPlanContext";
import { showNotification } from "../../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../../constants/application-constant";

interface ExtensionSuspensionInputProps {
  isFormFieldsLocked: boolean;
}

const ExtensionSuspensionInput = (props: ExtensionSuspensionInputProps) => {
  const [actSections, setActSections] = useState<ListType[]>([]);
  const [reasonCount, setReasonCount] = useState<number>(0);
  const changeReasonTextHandler = (event: any) => {
    setReasonCount(event.target.value.length);
  };
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const ctx = useContext(WorkplanContext);

  useEffect(() => {
    const eaActId = ctx.work?.ea_act_id;
    const getActSections = async (eaActId: number) => {
      try {
        setActSections(await eventsApi.listActSections(eaActId));
      } catch (e) {
        showNotification(COMMON_ERROR_MESSAGE, {
          type: "error",
        });
      }
    };
    if (eaActId) getActSections(eaActId);
  }, [ctx.work?.ea_act_id]);

  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel required>Act Section</ETFormLabel>
        <ControlledSelectV2
          disabled={props.isFormFieldsLocked}
          helperText={errors?.act_section_id?.message?.toString()}
          options={actSections || []}
          getOptionValue={(o: ListType) => o?.id.toString()}
          getOptionLabel={(o: ListType) => o?.name}
          {...register("act_section_id")}
        ></ControlledSelectV2>
      </Grid>
      <Grid item xs={12}>
        <ETFormLabelWithCharacterLimit
          characterCount={reasonCount}
          maxCharacterLength={60}
        >
          Reason
        </ETFormLabelWithCharacterLimit>
        <TextField
          fullWidth
          multiline
          disabled={props.isFormFieldsLocked}
          rows={3}
          InputProps={{
            inputProps: {
              maxLength: 60,
            },
          }}
          error={!!errors?.reason?.message}
          helperText={errors?.reason?.message?.toString()}
          {...register("reason")}
          onChange={changeReasonTextHandler}
        />
      </Grid>
    </>
  );
};
export default ExtensionSuspensionInput;
