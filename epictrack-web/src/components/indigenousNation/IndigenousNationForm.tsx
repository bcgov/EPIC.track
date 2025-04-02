import { FC, useEffect, useState } from "react";
import { Box, Grid, TextField, Tooltip } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { ListType } from "models/code";
import { Staff } from "../../models/staff";
import { PIPOrgType } from "../../models/pipOrgType";
import staffService from "../../services/staffService/staffService";
import pipOrgTypeService from "services/pipOrgTypeService";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { FirstNation, defaultFirstNation } from "../../models/firstNation";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { showNotification } from "components/shared/notificationProvider";
import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { IconProps } from "components/icons/type";
import icons from "components/icons";

const InfoIcon: FC<IconProps> = icons["InfoIcon"];

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .test(
      "validate-IndigenousNations",
      "Indigenous Nation with the given name already exists",
      async (value, { parent }) => {
        if (value) {
          const validateINationsResult =
            await indigenousNationService.checkIndigenousNationExists(
              value,
              parent["id"]
            );
          return !(validateINationsResult.data as any)["exists"] as boolean;
        }
        return true;
      }
    ),
  relationship_holder_id: yup.number().nullable(),
  pip_org_type_id: yup.number().nullable(),
  pip_link: yup.string().nullable(),
  is_active: yup.boolean(),
  notes: yup.string().nullable(),
});

type FirstNationFormProps = {
  firstNation: FirstNation | null;
  saveFirstNation: (data: any) => void;
};

export default function IndigenousNationForm({
  firstNation,
  saveFirstNation,
}: FirstNationFormProps) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [pipOrgTypes, setPipOrgTypes] = useState<PIPOrgType[]>([]);

  const methods = useForm<FirstNation>({
    resolver: yupResolver(schema),
    defaultValues: firstNation || defaultFirstNation,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(firstNation ?? defaultFirstNation);
  }, [firstNation, reset]);

  const getStaffs = async () => {
    try {
      const staffsResult = await staffService.getAll();
      if (staffsResult.status === 200) {
        setStaffs(staffsResult.data as Staff[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getPIPOrgTypes = async () => {
    try {
      const pipOrgTypeResult = await pipOrgTypeService.getAll();
      if (pipOrgTypeResult.status === 200) {
        setPipOrgTypes(pipOrgTypeResult.data as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    getStaffs();
    getPIPOrgTypes();
  }, []);

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="first-nation-form"
        container
        spacing={2}
        onSubmit={handleSubmit(saveFirstNation)}
      >
        <Grid item xs={6}>
          <ETFormLabel required>Name</ETFormLabel>
          <TextField
            placeholder="Name"
            fullWidth
            error={!!errors?.name?.message}
            helperText={errors?.name?.message?.toString()}
            {...register("name")}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Relationship Holder</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select a Relationship Holder"
            defaultValue={firstNation?.relationship_holder_id}
            getOptionLabel={(o: Staff) => (o ? o.full_name : "")}
            getOptionValue={(o: Staff) => (o ? o.id.toString() : "")}
            options={staffs}
            {...register("relationship_holder_id")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>PIP Organization Type</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select an Organization Type"
            defaultValue={firstNation?.pip_org_type_id}
            getOptionLabel={(o: PIPOrgType) => (o ? o.name : "")}
            getOptionValue={(o: PIPOrgType) => (o ? o.id.toString() : "")}
            options={pipOrgTypes || []}
            {...register("pip_org_type_id")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>PIP URL</ETFormLabel>
          <TextField fullWidth {...register("pip_link")} />
        </Grid>
        <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
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
        <Grid item xs={12}>
          <ETFormLabel>Notes</ETFormLabel>
          <ControlledRichTextEditor name="notes" />
        </Grid>
      </Grid>
    </FormProvider>
  );
}
