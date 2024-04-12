import React, { useEffect } from "react";
import { Divider, Grid } from "@mui/material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../../shared/index";
import { Project, defaultProject } from "../../../models/project";
import { Proponent } from "../../../models/proponent";
import { Region } from "../../../models/region";
import { Type } from "../../../models/type";
import { SubType } from "../../../models/subtype";
import subTypeService from "../../../services/subTypeService";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import projectService from "../../../services/projectService/projectService";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";

import { ProponentSpecialField } from "./ProponentSpecialField";
import { ProjectNameSpecialField } from "./ProjectNameSpecialField";
import { Restricted } from "../../shared/restricted";
import { ROLES } from "../../../constants/application-constant";
import { ListType } from "models/code";
import RegionService from "services/regionService";
import { REGIONS } from "../../../components/shared/constants";
import typeService from "services/typeService";
import proponentService from "services/proponentService/proponentService";
import { useAppSelector } from "hooks";
import { sort } from "utils";

const schema = yup.object().shape({
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
  abbreviation: yup.string(),
});

type ProjectFormProps = {
  project: Project | null;
  fetchProject: () => void;
  saveProject: (data: any) => void;
  setDisableDialogSave?: (disable: boolean) => void;
};

export default function ProjectForm({
  project,
  fetchProject,
  saveProject,
  setDisableDialogSave,
}: ProjectFormProps) {
  const [envRegions, setEnvRegions] = React.useState<ListType[]>();
  const [nrsRegions, setNRSRegions] = React.useState<ListType[]>();
  const [subTypes, setSubTypes] = React.useState<SubType[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [proponents, setProponents] = React.useState<Proponent[]>();

  const [isProponentFieldLocked, setIsProponentFieldLocked] =
    React.useState<boolean>(false);

  const [isNameFieldLocked, setIsNameFieldLocked] =
    React.useState<boolean>(false);

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = roles.includes(ROLES.EDIT);
  const isSpecialFieldLocked = isProponentFieldLocked || isNameFieldLocked;
  const shouldDisableSpecialField =
    (!isSpecialFieldLocked || !canEdit) && Boolean(project?.id);
  const shouldDisableFormField = !canEdit;

  React.useEffect(() => {
    if (setDisableDialogSave) {
      setDisableDialogSave(isSpecialFieldLocked);
    }
  }, [isSpecialFieldLocked]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: project ?? undefined,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    setError,
    resetField,
    watch,
  } = methods;

  useEffect(() => {
    reset(project ?? defaultProject);
  }, [project]);

  const formValues = useWatch({ control });

  const getSubTypesByType = async () => {
    const subTypeResult = await subTypeService.getSubTypeByType(
      formValues.type_id
    );
    if (subTypeResult.status === 200) {
      setSubTypes(subTypeResult.data as SubType[]);
      // The subtype select box wasn't resetting when type changes
      if (formValues.sub_type_id !== project?.sub_type_id) {
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
  }, [formValues.type_id, project]);

  React.useEffect(() => {
    getRegions();
    getTypes();
    getProponents();
  }, []);

  const typeChange = () => {
    setValue("sub_type_id", undefined);
  };

  const onSubmitHandler = async (data: any) => {
    saveProject(data);
  };

  const onBlurProjectName = async () => {
    if (!formValues.name || Boolean(project)) return;

    try {
      const response = await projectService.createProjectAbbreviation(
        formValues.name
      );
      const generatedAbbreviation = response.data as string;
      resetField("abbreviation");
      setValue("abbreviation", generatedAbbreviation);
    } catch (error) {
      if (formValues.abbreviation) {
        return;
      }

      setError("abbreviation", {
        type: "manual",
        message: `Abbreviation could not be auto-generated for "${formValues.name}"`,
      });
    }
  };

  const abbreviation = watch("abbreviation");

  const getRegions = async () => {
    const envRegionsResult = await RegionService.getRegions(REGIONS.ENV);
    if (envRegionsResult.status === 200) {
      const envRegions = envRegionsResult.data as ListType[];
      setEnvRegions(envRegions);
    }
    const nrsRegionsResult = await RegionService.getRegions(REGIONS.FLNR);
    if (nrsRegionsResult.status === 200) {
      const nrsRegions = nrsRegionsResult.data as ListType[];
      setNRSRegions(nrsRegions);
    }
  };

  const getTypes = async () => {
    const typesResult = await typeService.getAll();
    if (typesResult.status === 200) {
      const types = typesResult.data as ListType[];
      setTypes(types);
    }
  };

  const getProponents = async () => {
    const proponentsResult = await proponentService.getAll();
    if (proponentsResult.status === 200) {
      let proponents = proponentsResult.data as Proponent[];
      proponents = sort(proponents, "name");
      setProponents(proponents);
    }
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="project-form"
        container
        spacing={2}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <ProjectNameSpecialField
          id={project?.id}
          onLockClick={() => setIsNameFieldLocked((prev) => !prev)}
          open={isNameFieldLocked}
          onSave={() => {
            fetchProject();
          }}
          title={project?.name || ""}
          disabled={!canEdit}
        >
          <ControlledTextField
            name="name"
            placeholder="Project Name"
            disabled={shouldDisableSpecialField}
            variant="outlined"
            fullWidth
            onBlur={onBlurProjectName}
          />
        </ProjectNameSpecialField>
        <ProponentSpecialField
          id={project?.id}
          onLockClick={() => setIsProponentFieldLocked((prev) => !prev)}
          open={isProponentFieldLocked}
          onSave={() => {
            fetchProject();
          }}
          options={proponents || []}
          disabled={!canEdit}
        >
          <ControlledSelectV2
            placeholder="Select"
            disabled={shouldDisableSpecialField}
            key={`proponent_select_${formValues.proponent_id}`}
            helperText={errors?.proponent_id?.message?.toString()}
            defaultValue={project?.proponent_id}
            options={proponents || []}
            fullWidth
            getOptionValue={(o: Proponent) => o?.id?.toString()}
            getOptionLabel={(o: Proponent) => o.name}
            {...register("proponent_id")}
          ></ControlledSelectV2>
        </ProponentSpecialField>
        <Grid item xs={6}>
          <ETFormLabel required>Type</ETFormLabel>
          <ControlledSelectV2
            onHandleChange={typeChange}
            placeholder="Select"
            key={`type_select_${formValues.type_id}`}
            helperText={errors?.type_id?.message?.toString()}
            defaultValue={project?.type_id}
            options={types || []}
            getOptionValue={(o: Type) => o?.id?.toString()}
            getOptionLabel={(o: Type) => o.name}
            disabled={shouldDisableFormField}
            {...register("type_id")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Subtypes</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            key={`subtype_select_${formValues.sub_type_id}`}
            helperText={errors?.sub_type_id?.message?.toString()}
            defaultValue={project?.sub_type_id}
            options={subTypes || []}
            getOptionValue={(o: SubType) => o?.id?.toString()}
            getOptionLabel={(o: SubType) => o.name}
            disabled={shouldDisableFormField}
            {...register("sub_type_id")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel required>Project Description</ETFormLabel>
          <ControlledTextField
            name="description"
            fullWidth
            multiline
            rows={4}
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Divider style={{ width: "100%", marginTop: "20px" }} />
        <Grid item xs={12}>
          <ETFormLabel required>Location Description</ETFormLabel>
          <ControlledTextField
            name="address"
            placeholder="Provide a detailed description of a project's location"
            fullWidth
            multiline
            rows={3}
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Latitude</ETFormLabel>
          <ControlledTextField
            name="latitude"
            type="number"
            inputProps={{
              step: 0.000001,
            }}
            placeholder="e.g. 22.2222"
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Longitude</ETFormLabel>
          <ControlledTextField
            name="longitude"
            type="number"
            inputProps={{
              step: 0.00001,
            }}
            placeholder="e.g. -22.2222"
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>ENV Region</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            key={`env_select_${formValues.region_id_env}`}
            helperText={errors?.region_id_env?.message?.toString()}
            defaultValue={project?.region_id_env}
            options={envRegions || []}
            getOptionValue={(o: Region) => o?.id?.toString()}
            getOptionLabel={(o: Region) => o?.name}
            disabled={shouldDisableFormField}
            {...register("region_id_env")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>NRS Region</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            key={`nrs_select_${formValues.region_id_flnro}`}
            helperText={errors?.region_id_flnro?.message?.toString()}
            defaultValue={project?.region_id_flnro}
            options={nrsRegions || []}
            getOptionValue={(o: Region) => o?.id?.toString()}
            getOptionLabel={(o: Region) => o?.name}
            disabled={shouldDisableFormField}
            {...register("region_id_flnro")}
          ></ControlledSelectV2>
        </Grid>
        <Divider style={{ width: "100%", marginTop: "20px" }} />
        <Grid item xs={6}>
          <ETFormLabel>Capital Investment</ETFormLabel>
          <ControlledTextField
            name="capital_investment"
            type="number"
            inputProps={{
              min: 0,
              step: 1,
            }}
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>EPIC GUID</ETFormLabel>
          <ControlledTextField
            name="epic_guid"
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Est. FTE Positions in Construction</ETFormLabel>
          <ControlledTextField
            name="fte_positions_construction"
            type="number"
            inputProps={{
              min: 0,
              step: 1,
            }}
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Est. FTE Positions in Operation</ETFormLabel>
          <ControlledTextField
            name="fte_positions_operation"
            type="number"
            inputProps={{
              min: 0,
              step: 1,
            }}
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Certificate Number</ETFormLabel>
          <ControlledTextField
            name="ea_certificate"
            helperText
            fullWidth
            disabled={shouldDisableFormField}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Abbreviation</ETFormLabel>
          <Restricted
            allowed={[ROLES.EDIT]}
            errorProps={{ disabled: true }}
            exception={!abbreviation}
          >
            <ControlledTextField
              name={"abbreviation"}
              helperText
              fullWidth
              placeholder="EDRMS retrieval code"
              inputEffects={(e) => e.target.value.toUpperCase()}
              disabled={shouldDisableFormField}
            />
          </Restricted>
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
            name={"is_active"}
            disabled={shouldDisableFormField}
          />
          <ETFormLabel id="active">Active</ETFormLabel>
        </Grid>
        <Grid item xs={3}>
          <ControlledSwitch
            name={"is_project_closed"}
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            disabled={shouldDisableFormField}
          />
          <ETFormLabel id="active">Closed</ETFormLabel>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
