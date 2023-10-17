import React from "react";
import { TextField, Grid, Button, Divider, Box } from "@mui/material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import codeService, { Code } from "../../services/codeService";
import { Project } from "../../models/project";
import { Proponent } from "../../models/proponent";
import { Region } from "../../models/region";
import { Type } from "../../models/type";
import { SubType } from "../../models/subtype";
import subTypeService from "../../services/subTypeService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import projectService from "../../services/projectService/projectService";
import LockClosed from "../../assets/images/lock-closed.svg";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { Palette } from "../../styles/theme";

const schema = yup.object<Project>().shape({
  name: yup
    .string()
    .required("Project Name is required")
    .test({
      name: "checkDuplicateProjectName",
      exclusive: true,
      message: "Project with the given name already exists",
      test: async (value, { parent }) => {
        if (value) {
          const validateProjectResult = await projectService.checkProjectExists(
            value,
            parent["id"]
          );
          return !(validateProjectResult.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
  type_id: yup.string().required("Type is required"),
  proponent_id: yup.string().required("Proponent is required"),
  sub_type_id: yup.string().required("SubType is required"),
  description: yup.string().required("Project Description is required"),
  address: yup.string().required("Location Description is required"),
  latitude: yup
    .number()
    .typeError("Please provide a numerial value")
    .required()
    .min(-90, "Latitude must be greater than or equal to -90")
    .max(90, "Latitude must be less than or equal to 90"),
  longitude: yup
    .number()
    .typeError("Please provide a numerial value")
    .required()
    .min(-180, "Longitude must be greater than or equal to -180")
    .max(180, "Longitude must be less than or equal to 180"),
});

export default function ProjectForm({ ...props }) {
  const [envRegions, setEnvRegions] = React.useState<Region[]>();
  const [nrsRegions, setNRSRegions] = React.useState<Region[]>();
  const [subTypes, setSubTypes] = React.useState<SubType[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [proponents, setProponents] = React.useState<Proponent[]>();
  const [disabled, setDisabled] = React.useState<boolean>();
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    setDisabled(props.projectId ? true : false);
    ctx.setId(props.projectId);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Project,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;
  const formValues = useWatch({ control });

  React.useEffect(() => {
    reset(ctx.item);
  }, [ctx.item]);

  const setRegions = (regions: Region[]) => {
    const envRegions = regions.filter((p) => p.entity === "ENV");
    const nrsRegions = regions.filter((p) => p.entity === "FLNR");
    setEnvRegions(envRegions);
    setNRSRegions(nrsRegions);
  };
  const codeTypes: { [x: string]: any } = {
    regions: setRegions,
    types: setTypes,
    proponents: setProponents,
  };

  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };

  const getSubTypesByType = async () => {
    const subTypeResult = await subTypeService.getSubTypeByType(
      formValues.type_id
    );
    if (subTypeResult.status === 200) {
      setSubTypes(subTypeResult.data as SubType[]);
      // The subtype select box wasn't resetting when type changes
      if (formValues.sub_type_id !== (ctx.item as Project)?.sub_type_id) {
        reset({
          ...formValues,
          sub_type_id: undefined,
        });
      }
    }
  };

  React.useEffect(() => {
    if (formValues.type_id) {
      getSubTypesByType();
    }
  }, [formValues.type_id, ctx.item]);

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
    props.onSave();
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="project-form"
          container
          spacing={2}
          sx={{
            margin: 0,
            width: "100%",
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid
            container
            spacing={2}
            sx={{
              backgroundColor: Palette.neutral.bg.light,
              padding: "24px 40px",
            }}
          >
            <Grid item xs={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "3px",
                }}
              >
                <ETFormLabel required>Name</ETFormLabel>
                <ETFormLabel>
                  <Box
                    sx={{
                      opacity: disabled ? "100" : "0",
                      cursor: "pointer",
                    }}
                    component="img"
                    src={LockClosed}
                    alt="Lock"
                  />
                </ETFormLabel>
              </Box>
              <TextField
                placeholder="Project Name"
                disabled={disabled}
                variant="outlined"
                fullWidth
                error={!!errors?.name?.message}
                helperText={errors?.name?.message?.toString()}
                {...register("name")}
              />
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "3px",
                }}
              >
                <ETFormLabel required>Proponent</ETFormLabel>
                <ETFormLabel>
                  <Box
                    sx={{
                      opacity: disabled ? "100" : "0",
                      cursor: "pointer",
                    }}
                    component="img"
                    src={LockClosed}
                    alt="Lock"
                  />
                </ETFormLabel>
              </Box>
              <ControlledSelectV2
                placeholder="Select"
                disabled={disabled}
                key={`proponent_select_${formValues.proponent_id}`}
                helperText={errors?.proponent_id?.message?.toString()}
                defaultValue={(ctx.item as Project)?.proponent_id}
                options={proponents || []}
                getOptionValue={(o: Proponent) => o?.id?.toString()}
                getOptionLabel={(o: Proponent) => o.name}
                {...register("proponent_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel required>Type</ETFormLabel>
              <ControlledSelectV2
                placeholder="Select"
                key={`type_select_${formValues.type_id}`}
                helperText={errors?.type_id?.message?.toString()}
                defaultValue={(ctx.item as Project)?.type_id}
                options={types || []}
                getOptionValue={(o: Type) => o?.id?.toString()}
                getOptionLabel={(o: Type) => o.name}
                {...register("type_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel required>Subtypes</ETFormLabel>
              <ControlledSelectV2
                placeholder="Select"
                key={`subtype_select_${formValues.sub_type_id}`}
                helperText={errors?.sub_type_id?.message?.toString()}
                defaultValue={(ctx.item as Project)?.sub_type_id}
                options={subTypes || []}
                getOptionValue={(o: SubType) => o?.id?.toString()}
                getOptionLabel={(o: SubType) => o.name}
                {...register("sub_type_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel required>Project Description</ETFormLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors?.description?.message}
                helperText={errors?.description?.message?.toString()}
              />
            </Grid>
          </Grid>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              padding: "0px 40px 24px 40px",
              mt: 0,
              backgroundColor: Palette.white,
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <Grid item xs={12}>
              <ETFormLabel required>Location Description</ETFormLabel>
              <TextField
                placeholder="Provide a detailed description of a project's location"
                fullWidth
                multiline
                rows={3}
                {...register("address")}
                error={!!errors?.address?.message}
                helperText={errors?.address?.message?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Latitude</ETFormLabel>
              <TextField
                placeholder="e.g. 22.2222"
                fullWidth
                {...register("latitude")}
                error={!!errors?.latitude?.message}
                helperText={errors?.latitude?.message?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Longitude</ETFormLabel>
              <TextField
                placeholder="e.g. -22.2222"
                fullWidth
                {...register("longitude")}
                error={!!errors?.longitude?.message}
                helperText={errors?.longitude?.message?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>ENV Region</ETFormLabel>
              <ControlledSelectV2
                placeholder="Select"
                key={`env_select_${formValues.region_id_env}`}
                helperText={errors?.region_id_env?.message?.toString()}
                defaultValue={(ctx.item as Project)?.region_id_env}
                options={envRegions || []}
                getOptionValue={(o: Region) => o?.id?.toString()}
                getOptionLabel={(o: Region) => o?.name}
                {...register("region_id_env")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>NRS Region</ETFormLabel>
              <ControlledSelectV2
                placeholder="Select"
                key={`nrs_select_${formValues.region_id_flnro}`}
                helperText={errors?.region_id_flnro?.message?.toString()}
                defaultValue={(ctx.item as Project)?.region_id_flnro}
                options={nrsRegions || []}
                getOptionValue={(o: Region) => o?.id?.toString()}
                getOptionLabel={(o: Region) => o?.name}
                {...register("region_id_flnro")}
              ></ControlledSelectV2>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{
              mt: 0,
              backgroundColor: Palette.neutral.bg.light,
              padding: "0px 40px 16px 40px",
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <Grid item xs={6}>
              <ETFormLabel>Capital Investment</ETFormLabel>
              <TextField
                fullWidth
                {...register("capital_investment")}
                error={!!errors?.capital_investment?.message}
                helperText={errors?.capital_investment?.message?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>EPIC GUID</ETFormLabel>
              <TextField
                fullWidth
                {...register("epic_guid")}
                error={!!errors?.epic_guid?.message}
                helperText={errors?.epic_guid?.message?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Est. FTE Positions in Construction</ETFormLabel>
              <TextField
                fullWidth
                {...register("fte_positions_construction")}
                error={!!errors?.fte_positions_construction?.message}
                helperText={errors?.fte_positions_construction?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Est. FTE Positions in Operation</ETFormLabel>
              <TextField
                fullWidth
                {...register("fte_positions_operation")}
                error={!!errors?.fte_positions_operation?.message}
                helperText={errors?.fte_positions_operation?.toString()}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Certificate Number</ETFormLabel>
              <TextField helperText fullWidth {...register("ea_certificate")} />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Abbreviation</ETFormLabel>
              <TextField
                helperText
                fullWidth
                placeholder="EDRMS retrieval code"
                {...register("abbreviation")}
              />
            </Grid>
            <Grid
              item
              xs={3}
              sx={{
                paddingLeft: "0px",
              }}
            >
              <ControlledSwitch
                sx={{ paddingLeft: "0px", marginRight: "10px" }}
                defaultChecked={(ctx.item as Project)?.is_active}
                {...register("is_active")}
              />
              <ETFormLabel id="active">Active</ETFormLabel>
            </Grid>
            <Grid item xs={3}>
              <ControlledSwitch
                sx={{ paddingLeft: "0px", marginRight: "10px" }}
                defaultChecked={(ctx.item as Project)?.is_project_closed}
                {...register("is_project_closed")}
              />
              <ETFormLabel id="active">Closed</ETFormLabel>
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
