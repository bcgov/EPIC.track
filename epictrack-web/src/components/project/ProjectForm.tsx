import React from "react";
import { TextField, Grid, Button, Divider } from "@mui/material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import codeService, { Code } from "../../services/codeService";
import { Project } from "../../models/project";
import { Proponent } from "../../models/proponent";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import { Region } from "../../models/region";
import { Type } from "../../models/type";
import { SubType } from "../../models/subtype";
import subTypeService from "../../services/subTypeService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import projectService from "../../services/projectService/projectService";

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
  latitude: yup.string().required("Invalid latitude value"),
  longitude: yup.string().required("Invalid longitude value"),
  region_id_env: yup.string().required("ENV Region is required"),
  region_id_flnro: yup.string().required("NRS Region is required"),
});

export default function ProjectForm({ ...props }) {
  const [envRegions, setEnvRegions] = React.useState<Region[]>();
  const [nrsRegions, setNRSRegions] = React.useState<Region[]>();
  const [subTypes, setSubTypes] = React.useState<SubType[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [proponents, setProponents] = React.useState<Proponent[]>();
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("project-form");
  }, []);

  React.useEffect(() => {
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
    setValue,
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
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="project-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6}>
            <ETFormLabel>Project Name</ETFormLabel>
            <TextField
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Proponent</ETFormLabel>
            <ControlledSelectV2
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
            <ETFormLabel>Type</ETFormLabel>
            <ControlledSelectV2
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
            <ETFormLabel>SubType</ETFormLabel>
            <ControlledSelectV2
              key={`subtype_select_${formValues.sub_type_id}`}
              helperText={errors?.sub_type_id?.message?.toString()}
              defaultValue={(ctx.item as Project)?.sub_type_id}
              options={subTypes || []}
              getOptionValue={(o: SubType) => o.id.toString()}
              getOptionLabel={(o: SubType) => o.name}
              {...register("sub_type_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel>Project Description</ETFormLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              {...register("description")}
              error={!!errors?.description?.message}
              helperText={errors?.description?.message?.toString()}
            />
          </Grid>
          <Divider style={{ width: "100%", marginTop: "10px" }} />
          <Grid item xs={12}>
            <ETFormLabel>Location Description</ETFormLabel>
            <TextField
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
              fullWidth
              {...register("latitude")}
              error={!!errors?.latitude?.message}
              helperText={errors?.latitude?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Longitude</ETFormLabel>
            <TextField
              fullWidth
              {...register("longitude")}
              error={!!errors?.longitude?.message}
              helperText={errors?.longitude?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>ENV Region</ETFormLabel>
            <ControlledSelectV2
              key={`env_select_${formValues.region_id_env}`}
              helperText={errors?.region_id_env?.message?.toString()}
              defaultValue={(ctx.item as Project)?.region_id_env}
              options={envRegions || []}
              getOptionValue={(o: Region) => o.id.toString()}
              getOptionLabel={(o: Region) => o.name}
              {...register("region_id_env")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>NRS Region</ETFormLabel>
            <ControlledSelectV2
              key={`nrs_select_${formValues.region_id_flnro}`}
              helperText={errors?.region_id_flnro?.message?.toString()}
              defaultValue={(ctx.item as Project)?.region_id_flnro}
              options={nrsRegions || []}
              getOptionValue={(o: Region) => o.id.toString()}
              getOptionLabel={(o: Region) => o.name}
              {...register("region_id_flnro")}
            ></ControlledSelectV2>
          </Grid>
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
            <ETFormLabel>Certificate Number</ETFormLabel>
            <TextField helperText fullWidth {...register("ea_certificate")} />
            Provide the certificate number if available
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Abbreviation</ETFormLabel>
            <TextField helperText fullWidth {...register("abbreviation")} />
            Abbreviation of the project name to be displayed in reports and
            graphs
          </Grid>
          <Grid item xs={4} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Project)?.is_project_closed}
              {...register("is_project_closed")}
            />
            <ETFormLabel id="active">Is the Project Closed?</ETFormLabel>
          </Grid>
          <Grid item xs={2} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Project)?.is_active}
              {...register("is_active")}
            />
            <ETFormLabel id="active">Active</ETFormLabel>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
