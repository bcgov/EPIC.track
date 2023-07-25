import React from "react";
import {
  TextField,
  Grid,
  Button,
  FormHelperText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { UploadFile as UploadFileIcon } from "@mui/icons-material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import codeService from "../../../services/codeService";
import phaseService from "../../../services/phaseService";
import { Code } from "../../../services/codeService";
import { Template } from "../../../models/template";
import { TrackLabel } from "../../shared";
import { ListType } from "../../../models/code";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import TaskService from "../../../services/taskService";
import TrackDialog from "../../shared/TrackDialog";

export default function CreateTemplateForm({ ...props }) {
  // const [template, setTemplate] = React.useState<Template>();
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [phases, setPhases] = React.useState<ListType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
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
  const codeTypes: { [x: string]: any } = {
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    phases: setPhases,
  };
  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };
  const getTemplates = async (id: number) => {
    // const result = await TemplateService.getTemplates(id);
    // if (result.status === 200) {
    //   const template = (result.data as any)["template"];
    //   setTemplate(template);
    //   reset(template);
    // }
  };

  const getPhaseByWorkTypeEAact = async () => {
    const phaseResult = await phaseService.getPhaseByWorkTypeEAact(
      formValues.ea_act_id,
      formValues.work_type_id
    );
    if (phaseResult.status === 200) {
      setPhases(phaseResult.data as ListType[]);
      // if (
      //   formValues.work_type_id !== template?.work_type_id ||
      //   formValues.ea_act_id !== template?.ea_act_id
      // ) {
      //   reset({
      //     ...formValues,
      //     phase_id: undefined,
      //   });
      // }
    }
  };

  React.useEffect(() => {
    if (formValues.ea_act_id && formValues.work_type_id) {
      getPhaseByWorkTypeEAact();
    }
  }, [formValues.ea_act_id, formValues.work_type_id]);

  React.useEffect(() => {
    if (templateId) {
      getTemplates(templateId);
    }
  }, [templateId]);

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    setLoading(true);
    data["template_file"] = data["template_file"][0];
    const result = await TaskService.createTemplate(data);
    if (result.status === 201) {
      setAlertContentText("Template details inserted");
      setOpenAlertDialog(true);
      props.onSubmitSuccess();
      setLoading(false);
    }
    reset();
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
            <TrackLabel>Template Name</TrackLabel>
            <TextField
              inputProps={{ maxLength: 150 }}
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>EA Act</TrackLabel>
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
            <TrackLabel>Work Type</TrackLabel>
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
            <TrackLabel>Phase</TrackLabel>
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
            <TrackLabel style={{ display: "block" }}>Template File</TrackLabel>
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
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={"Success"}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
        isOkRequired
        onOk={() => {
          setOpenAlertDialog(false);
          props.onCancel();
        }}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
