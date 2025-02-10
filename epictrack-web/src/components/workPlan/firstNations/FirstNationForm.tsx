import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, TextField, Tooltip, Box } from "@mui/material";
import { ETFormLabel } from "../../shared";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { showNotification } from "../../shared/notificationProvider";
import IndigenousNationsConsultationLevels from "../../../services/indigenousNationConsultationLevel";
import indigenousNationService from "../../../services/indigenousNationService/indigenousNationService";
import { sort } from "../../../utils";
import workService from "../../../services/workService/workService";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import { WorkplanContext } from "../WorkPlanContext";
import {
  ConsultationLevel,
  FirstNation,
  WorkFirstNation,
} from "../../../models/firstNation";
import { OptionType } from "../../shared/filterSelect/type";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import { IconProps } from "components/icons/type";
import icons from "components/icons";

interface FirstNationFormProps {
  workNationId?: number;
  onSave: () => void;
}

const InfoIcon: React.FC<IconProps> = icons["InfoIcon"];

const schema = yup.object().shape({
  indigenous_nation_id: yup
    .string()
    .required("Please select a First Nation")
    .test({
      name: "checkDuplicateNationWorkAssociation",
      exclusive: true,
      message: "Selected Nation-Work Association already exists",
      test: async (value, { parent }) => {
        if (value) {
          const validateWorkNation = await workService.checkWorkNationExists(
            parent["work_id"],
            Number(value),
            parent["id"]
          );
          return !(validateWorkNation.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
  indigenous_consultation_level_id: yup
    .number()
    .typeError("Please select consultation level"),
});

const FirstNationForm = ({ onSave, workNationId }: FirstNationFormProps) => {
  const [firstNations, setFirstNations] = React.useState<FirstNation[]>([]);
  const [workFirstNation, setWorkFirstNation] =
    React.useState<WorkFirstNation>();
  const [consultationLevels, setConsultationLevels] = React.useState<
    OptionType[]
  >([]);

  const relationShipHolderRef = React.useRef(null);
  const pipLinkRef = React.useRef(null);
  const ctx = React.useContext(WorkplanContext);

  React.useEffect(() => {
    getAllFirstNations();
    getAllConsultationLevels();
  }, []);

  const getAllConsultationLevels = async () => {
    try {
      const result = await IndigenousNationsConsultationLevels.getAll();
      if (result.status === 200) {
        const consultationLevels = result.data.map(
          (level: ConsultationLevel) => {
            return {
              value: String(level.id),
              label: level.name,
            };
          }
        );
        setConsultationLevels(consultationLevels);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  React.useEffect(() => {
    reset({
      ...workFirstNation,
      work_id: ctx.work?.id,
      is_active: true,
    });
  }, [ctx.work?.id]);

  React.useEffect(() => {
    if (workNationId) {
      getWorkFirstNation();
    }
  }, [workNationId]);

  React.useEffect(() => {
    if (workFirstNation) {
      reset(workFirstNation);
    }
  }, [workFirstNation]);

  const getAllFirstNations = async () => {
    try {
      const result = await indigenousNationService.getAll(true);
      if (result.status === 200) {
        const firstNations = result.data as FirstNation[];
        setFirstNations(sort(firstNations, "name"));
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getWorkFirstNation = async () => {
    try {
      const result = await workService.getWorkFirstNation(Number(workNationId));
      if (result.status === 200) {
        const firstNation = result.data as WorkFirstNation;
        setWorkFirstNation(firstNation);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: workFirstNation,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const onSubmitHandler = async (data: WorkFirstNation) => {
    try {
      if (workNationId) {
        const createResult = await workService.updateFirstNation(
          data,
          Number(workNationId)
        );
        if (createResult.status === 200) {
          showNotification("Your changes were successfully saved", {
            type: "success",
          });
          if (onSave) {
            onSave();
          }
        }
      } else {
        const createResult = await workService.createFirstNation(
          data,
          Number(ctx.work?.id)
        );
        if (createResult.status === 201) {
          showNotification("First nation details inserted", {
            type: "success",
          });
          if (onSave) {
            onSave();
          }
        }
      }
    } catch (e: any) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const onFirstNationChangeHandler = (firstNationId: number) => {
    const selectedFirstNation = firstNations.filter(
      (p) => p.id === Number(firstNationId)
    )[0];
    (relationShipHolderRef?.current as any)["value"] = selectedFirstNation
      ? selectedFirstNation.relationship_holder?.full_name || ""
      : "";
    (pipLinkRef?.current as any)["value"] = selectedFirstNation
      ? selectedFirstNation.pip_link
      : "";
  };
  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="work-first-nation-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={12}>
          <ETFormLabel required>Nation</ETFormLabel>
          <ControlledSelectV2
            name="indigenous_nation_id"
            placeholder="Search for a First Nation"
            helperText={errors?.indigenous_nation_id?.message?.toString()}
            defaultValue={workFirstNation?.indigenous_nation_id}
            options={firstNations || []}
            disabled={!!workNationId}
            getOptionValue={(o: FirstNation) => o?.id?.toString()}
            getOptionLabel={(o: FirstNation) => o?.name}
            onHandleChange={(staffId: number) =>
              onFirstNationChangeHandler(staffId)
            }
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Relationship Holder</ETFormLabel>
          <TextField
            fullWidth
            disabled
            placeholder="Relationship Holder"
            inputRef={relationShipHolderRef}
            {...register("indigenous_nation.relationship_holder.full_name")}
            defaultValue={
              workFirstNation?.indigenous_nation?.relationship_holder
                ? workFirstNation?.indigenous_nation?.relationship_holder
                    .full_name
                : ""
            }
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>PIP Link</ETFormLabel>
          <TextField
            fullWidth
            disabled
            placeholder="PIP Link"
            inputRef={pipLinkRef}
            {...register("indigenous_nation.pip_link")}
            defaultValue={workFirstNation?.indigenous_nation?.pip_link}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel>Consultation Level</ETFormLabel>
          <ControlledSelectV2
            name="indigenous_consultation_level_id"
            placeholder="Select / Confirm PIN Status"
            options={consultationLevels || []}
            getOptionValue={(o: OptionType) => String(o?.value)}
            getOptionLabel={(o: OptionType) => o.label}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={12}>
          <ControlledSwitch name="is_active" />
          <ETFormLabel id="active">Active</ETFormLabel>
          <Tooltip
            sx={{ paddingLeft: "2px" }}
            title="A Nation is considered INACTIVE if it is no longer being consulted/notified about the PROJECT"
          >
            <Box component={"span"}>
              <InfoIcon />
            </Box>
          </Tooltip>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default FirstNationForm;
