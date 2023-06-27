import React from "react";
import {
  TextField,
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import codeService from "../../../services/codeService";
import { WorkTombstone } from "../../../models/work";
import { ListType } from "../../../models/code";
import { Ministry } from "../../../models/ministry";
import { Code } from "../../../services/codeService";
import { TrackLabel } from "../../shared";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DATE_FORMAT } from "../../../constants/application-constant";
import WorkService from "../../../services/workService";
import ControlledCheckbox from "../../shared/controlledInputComponents/ControlledCheckbox";
import { Staff } from "../../../models/staff";
import StaffService from "../../../services/staffService";
import TrackDialog from "../../shared/TrackDialog";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";

export default function WorkTombstoneForm({ ...props }) {
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [projects, setProjects] = React.useState<ListType[]>([]);
  const [ministries, setMinistries] = React.useState<Ministry[]>([]);
  const [federalInvolvements, setFederalInvolvements] = React.useState<
    ListType[]
  >([]);
  const [substitutionActs, setSubtitutionActs] = React.useState<ListType[]>([]);
  const [teams, setTeams] = React.useState<ListType[]>([]);
  const [epds, setEPDs] = React.useState<Staff[]>([]);
  const [leads, setLeads] = React.useState<Staff[]>([]);
  const [decisionMakers, setDecisionMakers] = React.useState<Staff[]>([]);

  // const [positions, setPositions] = React.useState<Position[]>([]);
  const [work, setWork] = React.useState<WorkTombstone>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const workId = props.workId;
  const schema = yup.object<WorkTombstone>().shape({
    ea_act_id: yup.number().required("EA Act is required"),
    work_type_id: yup.number().required("Work type is required"),
    start_date: yup.date().required("Start date is required"),
    project_id: yup.number().required("Project is required"),
    ministry_id: yup.number().required("Responsible ministry is required"),
    federal_involvement_id: yup
      .number()
      .required("Federal Involvement is required"),
    title: yup
      .string()
      .required("Title is required")
      .test(
        "validate-Work",
        "Work with same title already exists",
        async (value) => {
          if (!value) return true;
          const validateWorkResult = await WorkService.checkWorkExists(
            value,
            workId
          );
          return !(validateWorkResult.data as any)["exists"] as boolean;
        }
      ),
    substitution_act_id: yup.number(),
    short_description: yup.string(),
    long_description: yup.string(),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: work,
  });
  console.log("acts", eaActs);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  const codeTypes: { [x: string]: any } = {
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    projects: setProjects,
    ministries: setMinistries,
    federal_involvements: setFederalInvolvements,
    substitution_acts: setSubtitutionActs,
    eao_teams: setTeams,
  };

  const staffByRoles: { [x: string]: any } = {
    "4": setLeads,
    "3": setEPDs,
    "1,2,8": setDecisionMakers,
  };
  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };
  const getWorkTombstone = async (id: number) => {
    const result = await WorkService.getWork(id);
    if (result.status === 200) {
      const work = (result.data as any)["work"];
      work.start_date = dayjs(work.start_date);
      setWork(work);
      reset(work);
    }
  };

  const getStaffByPosition = async (position: string) => {
    const staffResult = await StaffService.getStaffByPosition(position);
    if (staffResult.status === 200) {
      staffByRoles[position](staffResult.data as never);
    }
  };

  React.useEffect(() => {
    if (workId) {
      getWorkTombstone(workId);
    }
  }, [workId]);

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Object.keys(staffByRoles).forEach(async (key) => {
      promises.push(getStaffByPosition(key));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    console.log(data, "data");
    setLoading(true);
    if (workId) {
      const result = await WorkService.updateWork(data);
      if (result.status === 200) {
        setAlertContentText("Work details updated");
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    } else {
      const result = await WorkService.createWork(data);
      if (result.status === 201) {
        setAlertContentText("Work details inserted");
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    }
    reset();
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="work-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={4}>
            <TrackLabel>EA Act</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={work?.ea_act_id}
              options={eaActs || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("ea_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Worktype</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={work?.ea_act_id}
              options={workTypes || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("work_type_id")}
            ></ControlledSelectV2>
            {/* <Controller
              name="work_type_id"
              control={control}
              render={({ field }) => {
                const { onChange, value, ref } = field;
                return (
                  <Autocomplete
                    sx={{
                      [`& .MuiInputBase-root`]: {
                        padding: "5px",
                        border: "1px solid",
                        borderColor: "black",
                        borderRadius: "4px",
                      },
                    }}
                    options={workTypes}
                    size="medium"
                    autoFocus
                    defaultValue={workTypes.find(
                      (option) => option.id === work?.work_type_id
                    )}
                    getOptionLabel={(option: ListType) => option.name}
                    {...register("work_type_id")}
                    value={
                      value
                        ? workTypes.find((option) => {
                            return value === option.id;
                          }) ?? null
                        : null
                    }
                    onChange={(
                      e: SyntheticEvent<Element, Event>,
                      value: ListType | null
                    ) => onChange(value ? value.id : null)}
                    ref={ref}
                    renderInput={(params) => (
                      <TextField
                        error={!!errors?.work_type_id?.message}
                        helperText={errors?.work_type_id?.message?.toString()}
                        {...params}
                        variant="standard"
                      />
                    )}
                  />
                );
              }}
            /> */}
          </Grid>
          <Grid item xs={4}>
            <TrackLabel className="start-date-label">Start date</TrackLabel>
            <Controller
              name="start_date"
              control={control}
              defaultValue={work?.start_date}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format={DATE_FORMAT}
                    // onChange={(dateVal: any) =>
                    //   props.setReportDate(dateUtils.formatDate(dateVal.$d))
                    // }
                    slotProps={{
                      textField: {
                        id: "start_date",
                        fullWidth: true,
                        error: error ? true : false,
                        helperText: error?.message,
                      },
                      ...register("start_date"),
                    }}
                    value={value}
                    onChange={(event) => {
                      onChange(event);
                    }}
                    defaultValue={work?.start_date ? work.start_date : ""}
                    sx={{ display: "block" }}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>
          <Divider style={{ width: "100%", marginTop: "10px" }} />
          <Grid item xs={6}>
            <TrackLabel>Project</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.project_id?.message?.toString()}
              defaultValue={work?.project_id}
              options={projects || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("project_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Responsible Ministry</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ministry_id?.message?.toString()}
              defaultValue={work?.ministry_id}
              options={ministries || []}
              getOptionValue={(o: Ministry) => o.id.toString()}
              getOptionLabel={(o: Ministry) => o.name}
              {...register("ministry_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Federal Involvement</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.federal_involvement_id?.message?.toString()}
              defaultValue={work?.federal_involvement_id}
              options={federalInvolvements || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("federal_involvement_id")}
            ></ControlledSelectV2>
          </Grid>

          <Grid item xs={6}>
            <TrackLabel>Federal Act</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.substitution_act_id?.message?.toString()}
              defaultValue={work?.substitution_act_id}
              options={substitutionActs || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("substitution_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Title</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.title?.message}
              helperText={errors?.title?.message?.toString()}
              {...register("title")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Short Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              error={!!errors?.short_description?.message}
              helperText={errors?.short_description?.message?.toString()}
              {...register("short_description")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Long Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              error={!!errors?.long_description?.message}
              helperText={errors?.long_description?.message?.toString()}
              {...register("long_description")}
            />
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={work?.is_pecp_required}
              {...register("is_pecp_required")}
            />
            <TrackLabel id="is_pcp_required">PCP Required</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={work?.is_cac_recommended}
              {...register("is_cac_recommended")}
            />
            <TrackLabel id="is_cac_recommended">CAC Required</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={work?.is_watched}
              {...register("is_watched")}
            />
            <TrackLabel id="is_watched">Watched</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={work?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="is_active">Active</TrackLabel>
          </Grid>

          <Divider style={{ width: "100%", marginTop: "10px" }} />

          <Grid item xs={6}>
            <TrackLabel>EAO Team</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.eao_team_id?.message?.toString()}
              defaultValue={work?.eao_team_id}
              options={teams || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("eao_team_id")}
            ></ControlledSelectV2>
          </Grid>

          <Grid item xs={6}>
            <TrackLabel>Responsible EPD</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.responsible_epd_id?.message?.toString()}
              defaultValue={work?.responsible_epd_id}
              options={epds || []}
              getOptionValue={(o: Staff) => o.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("responsible_epd_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Work Lead</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.work_lead_id?.message?.toString()}
              defaultValue={work?.work_lead_id}
              options={leads || []}
              getOptionValue={(o: Staff) => o.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("work_lead_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            {/* TODO: Make the label dynamic */}
            <TrackLabel>Decision Maker</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.decision_by_id?.message?.toString()}
              defaultValue={work?.decision_by_id}
              options={decisionMakers || []}
              getOptionValue={(o: Staff) => o.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("decision_by_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: "0.5rem", justifyContent: "right" }}
          >
            <Button variant="outlined" type="reset" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </FormProvider>
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={"Success"}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
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
