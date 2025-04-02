import React from "react";
import { TextField, Grid, Button, FormHelperText } from "@mui/material";
import { UploadFile as UploadFileIcon } from "@mui/icons-material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import phaseService from "../../../services/phaseService";
import { Template } from "../../../models/template";
import { ETFormLabel } from "../../shared";
import { ListType } from "../../../models/code";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { showNotification } from "../../shared/notificationProvider";
import templateService from "../../../services/taskService/templateService";
import { getErrorMessage } from "../../../utils/axiosUtils";
import eaActService from "services/eaActService";
import workService from "services/workService/workService";

export default function TemplateForm({ ...props }) {
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [phases, setPhases] = React.useState<ListType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const templateId = props.templateId;
  const schema = yup.object<Template>().shape({
    ea_act_id: yup.number().required("EA Act is required"),
    work_type_id: yup.number().required("Work type is required"),
    phase_id: yup.number().required("Phase is required"),
    name: yup.string().required("Name is required"),
    template_file: yup
      .mixed()
      .test("required", "Template file is required", (value: any) => {
        if (value?.length > 0) {
          return true;
        }
        return false;
      }),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    // defaultValues: {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;
  const formValues = useWatch({ control });

  const getPhaseByWorkTypeEAact = async () => {
    const phaseResult = await phaseService.getPhaseByWorkTypeEAact(
      formValues.ea_act_id,
      formValues.work_type_id
    );
    if (phaseResult.status === 200) {
      setPhases(phaseResult.data as ListType[]);
    }
  };

  const getEAActs = async () => {
    const eaActResult = await eaActService.getAll();
    if (eaActResult.status === 200) {
      const eaActs = eaActResult.data as ListType[];
      setEAActs(eaActs);
    }
  };

  const getWorkTypes = async () => {
    const workTypeResult = await workService.getWorkTypes();
    if (workTypeResult.status === 200) {
      const workType = workTypeResult.data as ListType[];
      setWorkTypes(workType);
    }
  };

  React.useEffect(() => {
    if (formValues.ea_act_id && formValues.work_type_id) {
      getPhaseByWorkTypeEAact();
    }
  }, [formValues.ea_act_id, formValues.work_type_id]);

  React.useEffect(() => {
    getEAActs();
    getWorkTypes();
  }, []);

  const onSubmitHandler = async (data: any) => {
    try {
      setLoading(true);
      data["template_file"] = data["template_file"][0];
      const result = await templateService.createTemplate(data);
      if (result.status === 201) {
        showNotification("Template details inserted", {
          type: "success",
        });
        props.onSubmitSuccess();
        setLoading(false);
      }
      reset();
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="template-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={12}>
            <ETFormLabel>Template Name</ETFormLabel>
            <TextField
              inputProps={{ maxLength: 150 }}
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel>EA Act</ETFormLabel>
            <ControlledSelectV2
              key={`eaact_select_${formValues.ea_act_id}`}
              helperText={errors?.ea_act_id?.message?.toString()}
              options={eaActs || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("ea_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel>Work Type</ETFormLabel>
            <ControlledSelectV2
              key={`worktype_select_${formValues.work_type_id}`}
              helperText={errors?.work_type_id?.message?.toString()}
              options={workTypes || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("work_type_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel>Phase</ETFormLabel>
            <ControlledSelectV2
              key={`phase_select_${formValues.phase_id}`}
              helperText={errors?.phase_id?.message?.toString()}
              options={phases || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("phase_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel style={{ display: "block" }}>
              Template File
            </ETFormLabel>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              color={errors?.template_file?.message ? "error" : "primary"}
            >
              {formValues.template_file?.length > 0
                ? formValues.template_file[0].name
                : "Upload Template File"}
              <input
                type="file"
                hidden
                {...register("template_file")}
                accept=".xls, .xlsx"
              />
            </Button>
            {errors?.template_file?.message && (
              <FormHelperText
                error={true}
                className="MuiFormHelperText-sizeSmall"
                style={{ marginInline: "14px" }}
              >
                {String(errors?.template_file?.message || "")}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
