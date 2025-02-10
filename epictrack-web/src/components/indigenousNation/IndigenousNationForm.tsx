import React from "react";
import { TextField, Grid, Box, Tooltip } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { FirstNation, defaultFirstNation } from "../../models/firstNation";
import staffService from "../../services/staffService/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import { PIPOrgType } from "../../models/pipOrgType";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";
import pipOrgTypeService from "services/pipOrgTypeService";
import { ListType } from "models/code";
import { IconProps } from "components/icons/type";
import icons from "components/icons";

const InfoIcon: React.FC<IconProps> = icons["InfoIcon"];

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

export default function IndigenousNationForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [pipOrgTypes, setPipOrgTypes] = React.useState<PIPOrgType[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("indigenous-nation-form");
  }, []);

  React.useEffect(() => {
    ctx.setTitle(ctx.item ? (ctx.item as FirstNation)?.name : "Nation");
  }, [ctx.title, ctx.item]);

  React.useEffect(() => {
    ctx.setId(props.indigenousNationID);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as FirstNation,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  React.useEffect(() => {
    reset(ctx.item ?? defaultFirstNation);
  }, [ctx.item]);

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

  const codeTypes: { [x: string]: any } = {
    pip_org_types: setPipOrgTypes,
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

  React.useEffect(() => {
    getStaffs();
    getPIPOrgTypes();
  }, []);

  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
    ctx.setId(undefined);
  };

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="indigenous-nation-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
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
              defaultValue={
                (ctx.item as FirstNation)?.relationship_holder_id || ""
              }
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
              defaultValue={(ctx.item as FirstNation)?.pip_org_type_id || ""}
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
    </>
  );
}
