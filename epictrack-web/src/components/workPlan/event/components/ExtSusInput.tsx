import { Grid, TextField } from "@mui/material";
import React from "react";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../../shared";
import ControlledSelectV2 from "../../../shared/controlledInputComponents/ControlledSelectV2";
import { useFormContext } from "react-hook-form";
import { ListType } from "../../../../models/code";

const ExtSusInput = () => {
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
  React.useEffect(() => {
    return () => {
      unregister("act_section_id");
      unregister("reason");
    };
  }, []);
  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel required>Act Section</ETFormLabel>
        <ControlledSelectV2
          helperText={errors?.act_section_id?.message?.toString()}
          options={actSections || []}
          getOptionValue={(o: ListType) => o.id.toString()}
          getOptionLabel={(o: ListType) => o.name}
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
export default ExtSusInput;
