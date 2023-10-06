import { Grid, TextField } from "@mui/material";
import React from "react";
import { ETFormLabel } from "../../../shared";
import ControlledSelectV2 from "../../../shared/controlledInputComponents/ControlledSelectV2";
import { useFormContext } from "react-hook-form";
import { ListType } from "../../../../models/code";

export interface DecisionInputProps {
  configurationId: number;
}
const DecisionInput = () => {
  const [decisionMakers, setDecisionMakers] = React.useState<ListType[]>([]);
  const [outcomes, setOutcomes] = React.useState<ListType[]>([]);
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel required>Decision Maker</ETFormLabel>
        <ControlledSelectV2
          helperText={errors?.decision_maker_id?.message?.toString()}
          options={decisionMakers || []}
          getOptionValue={(o: ListType) => o.id.toString()}
          getOptionLabel={(o: ListType) => o.name}
          {...register("act_section_id")}
        ></ControlledSelectV2>
      </Grid>
      <Grid item xs={12}>
        <ETFormLabel>Decision</ETFormLabel>
        <ControlledSelectV2
          helperText={errors?.outcome_id?.message?.toString()}
          options={outcomes || []}
          getOptionValue={(o: ListType) => o.id.toString()}
          getOptionLabel={(o: ListType) => o.name}
          {...register("outcome_id")}
        ></ControlledSelectV2>
      </Grid>
    </>
  );
};
export default DecisionInput;
