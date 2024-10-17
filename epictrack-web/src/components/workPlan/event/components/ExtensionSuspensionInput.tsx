import React from "react";
import { Grid, TextField } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import ControlledSelectV2 from "../../../shared/controlledInputComponents/ControlledSelectV2";
import { ListType } from "../../../../models/code";
import { useFormContext } from "react-hook-form";
import actSectionService from "../../../../services/actSectionService/actSectionService";
import { WorkplanContext } from "../../WorkPlanContext";
import { showNotification } from "../../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../../constants/application-constant";

interface ExtensionSuspensionInputProps {
  isFormFieldsLocked: boolean;
}

const ExtensionSuspensionInput = (props: ExtensionSuspensionInputProps) => {
  const [actSections, setActSections] = React.useState<ListType[]>([]);
  const [reasonCount, setReasonCount] = React.useState<number>(0);
  const changeReasonTextHandler = (event: any) => {
    setReasonCount(event.target.value.length);
  };
  const {
    register,
    unregister,
    formState: { errors },
  } = useFormContext();
  const ctx = React.useContext(WorkplanContext);

  React.useEffect(() => {
    getActSections();
  }, []);
  const getActSections = async () => {
    try {
      const result = await actSectionService.getActSectionsByEaAct(
        ctx.work?.ea_act_id
      );
      if (result.status === 200) {
        setActSections(result.data as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };
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
