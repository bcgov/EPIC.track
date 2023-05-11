import React, { SyntheticEvent } from "react";
import {
  TextField,
  Grid,
  Button,
  MenuItem,
  Backdrop,
  CircularProgress,
  Divider,
  Autocomplete,
  AutocompleteProps,
} from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// import { TrackLabel } from "../shared/index";
import codeService from "../../../services/codeService";
// import { Position, Staff } from "../../models/staff";
// import StaffService from "../../services/staffService";
// import ControlledSelect from "../shared/controlledInputComponents/ControlledSelect";
// import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
// import TrackDialog from "../shared/TrackDialog";
import { WorkTombstone } from "../../../models/work";
import { ListType } from "../../../models/code";
import { Ministry } from "../../../models/ministry";
import { Code } from "../../../services/codeService";
import { EpicTrackPageGridContainer, TrackLabel } from "../../shared";
import ControlledSelect from "../../shared/controlledInputComponents/ControlledSelect";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DATE_FORMAT } from "../../../constants/application-constant";
import { dateUtils } from "../../../utils";

const schema = yup.object<WorkTombstone>().shape({
  ea_act_id: yup.number().required("EA Act is required"),
  work_type_id: yup.number().required("Work type is required"),
  start_date: yup.string().required("Start date is required"),
  project_id: yup.number().required("Project is required"),
  ministry_id: yup.number().required("Responsible ministry is required"),
  federal_involvement_id: yup
    .number()
    .required("Federal Involvement is required"),
  title: yup.string().required("Title is required"),
});

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
  // const [epds, setEPDs] = React.useState<Staff[]>();
  // const [leads, setLeads] = React.useState<Staff[]>();

  // const [positions, setPositions] = React.useState<Position[]>([]);
  const [work, setWork] = React.useState<WorkTombstone>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const workId = props.workId;
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
  //#region listings
  // const findMethod = (code: Code) => {
  //   switch(code){
  //     case "ea_acts": return setEAActs;
  //     case "work_types": return setWorkTypes;
  //     case "projects": return setProjects;
  //     case "ministries": return setMinistries;
  //     case "federal_involvements": return setFederalInvolvements;
  //     case "substitution_acts": return setSubtitutionActs;
  //     case "eao_teams": return setTeams;
  //     case "ea_acts": return setEAActs;
  //   }
  //   return setEAActs;
  // }
  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };
  //#endregion
  const getWorkTombstone = async (id: number) => {
    const result = { status: 200, data: {} }; //await StaffService.getStaff(id);
    if (result.status === 200) {
      setWork(result.data as WorkTombstone);
      //reset((result.data as never)["staff"]);
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
    Promise.all(promises);
  }, []);

  // const getPositions = async () => {
  //   const positionResult = await codeService.getCodes("positions");
  //   if (positionResult.status === 200) {
  //     setPositions((positionResult.data as never)["codes"]);
  //   }
  // };
  // React.useEffect(() => {
  //   getPositions();
  // }, []);
  const onSubmitHandler = async (data: any) => {
    console.log(data);
    setLoading(true);
    // if (staffId) {
    //   const result = await StaffService.updateStaff(data);
    //   if (result.status === 200) {
    //     setAlertContentText("Staff details updated");
    //     setOpenAlertDialog(true);
    //     props.onSubmitSuccess();
    //     setLoading(false);
    //   }
    // } else {
    //   const result = await StaffService.createStaff(data);
    //   if (result.status === 201) {
    //     setAlertContentText("Staff details inserted");
    //     setOpenAlertDialog(true);
    //     props.onSubmitSuccess();
    //     setLoading(false);
    //   }
    // }
    // reset();
  };
  return (
    <EpicTrackPageGridContainer>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="staff-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={4}>
            <TrackLabel>EA Act</TrackLabel>
            <ControlledSelect
              error={!!errors?.ea_act_id?.message}
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={work?.ea_act_id}
              fullWidth
              {...register("ea_act_id")}
            >
              {eaActs.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Worktype</TrackLabel>
            <Controller
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
            />

            {/* <ControlledSelect
              error={!!errors?.work_type_id?.message}
              helperText={errors?.work_type_id?.message?.toString()}
              defaultValue={work?.work_type_id}
              fullWidth
              {...register("work_type_id")}
            >
              {workTypes.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect> */}
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Start date</TrackLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format={DATE_FORMAT}
                // onChange={(dateVal: any) =>
                //   props.setReportDate(dateUtils.formatDate(dateVal.$d))
                // }
                slotProps={{
                  textField: {
                    id: "start_date",
                  },
                  ...register("start_date"),
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Divider />
          <Grid item xs={4}>
            <TrackLabel>Project</TrackLabel>
            <ControlledSelect
              error={!!errors?.project_id?.message}
              helperText={errors?.project_id?.message?.toString()}
              defaultValue={work?.project_id}
              fullWidth
              {...register("project_id")}
            >
              {projects.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Responsible Ministry</TrackLabel>
            <ControlledSelect
              error={!!errors?.ministry_id?.message}
              helperText={errors?.ministry_id?.message?.toString()}
              defaultValue={work?.ministry_id}
              fullWidth
              {...register("ministry_id")}
            >
              {ministries.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Federal Involvement</TrackLabel>
            <ControlledSelect
              error={!!errors?.federal_involvement_id?.message}
              helperText={errors?.federal_involvement_id?.message?.toString()}
              defaultValue={work?.federal_involvement_id}
              fullWidth
              {...register("federal_involvement_id")}
            >
              {federalInvolvements.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
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
      {/* <TrackDialog
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
      </Backdrop> */}
    </EpicTrackPageGridContainer>
  );
}
