import { Grid } from "@mui/material";
import React from "react";
import { ETFormLabel } from "../../../shared";
import ControlledSelectV2 from "../../../shared/controlledInputComponents/ControlledSelectV2";
import { useFormContext } from "react-hook-form";
import { ListType } from "../../../../models/code";
import staffService from "../../../../services/staffService/staffService";
import { showNotification } from "../../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../../constants/application-constant";
import outcomeConfigurationService from "../../../../services/outcomeConfigurationService/outcomeConfigurationService";
import { Staff } from "../../../../models/staff";

export interface DecisionInputProps {
  configurationId?: number;
  decisionMakerPositionId?: number[];
  decisionMakerId?: number;
  isFormFieldsLocked: boolean;
}
const DecisionInput = ({
  decisionMakerPositionId,
  decisionMakerId,
  configurationId,
  isFormFieldsLocked,
}: DecisionInputProps) => {
  const [decisionMakers, setDecisionMakers] = React.useState<Staff[]>([]);
  const [outcomes, setOutcomes] = React.useState<ListType[]>([]);
  const {
    register,
    formState: { errors },
  } = useFormContext();
  React.useEffect(() => {
    getDecisionMakers();
    if (configurationId) {
      getOutcomes();
    }
  }, []);
  const getOutcomes = async () => {
    try {
      const result = await outcomeConfigurationService.getOutcomeConfigurations(
        Number(configurationId)
      );
      if (result.status === 200) {
        setOutcomes(result.data as any[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };
  const getDecisionMakers = async () => {
    try {
      if (decisionMakerId) {
        const result = await staffService.getById(String(decisionMakerId));
        if (result.status === 200) {
          setDecisionMakers([result.data as Staff]);
        }
      } else if (decisionMakerPositionId) {
        const result = await staffService.getStaffByPosition(
          decisionMakerPositionId.join(",")
        );
        if (result.status === 200) {
          setDecisionMakers(result.data as Staff[]);
        }
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  return (
    <>
      <Grid item xs={6}>
        <ETFormLabel required>Decision Maker</ETFormLabel>
        <ControlledSelectV2
          disabled={isFormFieldsLocked}
          helperText={errors?.decision_maker_id?.message?.toString()}
          options={decisionMakers || []}
          getOptionValue={(o: Staff) => o?.id?.toString()}
          getOptionLabel={(o: Staff) => o?.full_name}
          {...register("decision_maker_id")}
        ></ControlledSelectV2>
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>Decision</ETFormLabel>
        <ControlledSelectV2
          disabled={isFormFieldsLocked}
          helperText={errors?.outcome_id?.message?.toString()}
          options={outcomes || []}
          getOptionValue={(o: ListType) => o?.id?.toString()}
          getOptionLabel={(o: ListType) => o?.name}
          {...register("outcome_id")}
        ></ControlledSelectV2>
      </Grid>
    </>
  );
};
export default DecisionInput;
