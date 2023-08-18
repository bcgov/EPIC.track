import React, { SyntheticEvent } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import Moment from "moment";
import {
  COMMON_ERROR_MESSAGE,
  DATE_FORMAT,
} from "../../../constants/application-constant";
import { Grid, TextField } from "@mui/material";
import { ETFormLabel } from "../../shared";
import { TaskEvent, statusOptions } from "../../../models/task_event";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { Staff } from "../../../models/staff";
import { WorkplanContext } from "../WorkPlanContext";
import workService from "../../../services/workService/workService";
import taskEventService from "../../../services/taskEventService/taskEventService";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { ListType } from "../../../models/code";
import codeService from "../../../services/codeService";
import RichTextEditor from "../../shared/richTextEditor";
import { dateUtils } from "../../../utils";
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  start_date: yup.string().required("Please select start date"),
  status: yup.string().required("Please select status"),
});

interface TaskFormProps {
  onSave: () => void;
  eventId?: number;
}
const TaskForm = ({ onSave, eventId }: TaskFormProps) => {
  const [taskEvent, setTaskEvent] = React.useState<TaskEvent>();
  const [assignees, setAssignees] = React.useState<Staff[]>([]);
  const [responsibilities, setResponsibilities] = React.useState<ListType[]>(
    []
  );
  const [notes, setNotes] = React.useState("");
  const endDateRef = React.useRef();
  const startDateRef = React.useRef();
  const ctx = React.useContext(WorkplanContext);
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: taskEvent,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  React.useEffect(() => {
    getResponsibilites();
  }, []);

  React.useEffect(() => {
    if (eventId) {
      getTaskEvent();
    }
  }, [eventId]);

  React.useEffect(() => {
    getWorkTeamMembers();
  }, [ctx.work?.id]);

  React.useEffect(() => {
    reset(taskEvent);
  }, [taskEvent]);

  const getTaskEvent = async () => {
    try {
      const result = await taskEventService.getById(Number(eventId));
      if (result.status === 200) {
        const assignee_ids: any[] = (result.data as any)["assignees"].map(
          (p: any) => p["assignee_id"]
        );
        const taskEvent = result.data as TaskEvent;
        taskEvent.assignee_ids = assignee_ids;
        (endDateRef?.current as any)["value"] = dateUtils.formatDate(
          dateUtils
            .add(taskEvent.start_date, taskEvent.number_of_days, "days")
            .toISOString()
        );
        setTaskEvent(taskEvent);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
      if (onSave) {
        onSave();
      }
    }
  };

  const getResponsibilites = async () => {
    const result = await codeService.getCodes("responsibilities");
    if (result.status === 200) {
      setResponsibilities((result.data as any)["codes"] as ListType[]);
    }
  };
  const getWorkTeamMembers = async () => {
    const assigneeResult = await workService.getWorkTeamMembers(
      Number(ctx.work?.id)
    );
    if (assigneeResult.status === 200) {
      setAssignees(assigneeResult.data as Staff[]);
    }
  };
  const statuses = React.useMemo(() => statusOptions, []);
  const onSubmitHandler = async (data: TaskEvent) => {
    try {
      data.work_id = Number(ctx.work?.id);
      data.phase_id = Number(ctx.selectedPhase?.phase_id);
      data.start_date = Moment(data.start_date).format();
      data.number_of_days =
        data.number_of_days.toString() === "" ? 0 : data.number_of_days;
      data.notes = notes;
      if (eventId) {
        const createResult = await taskEventService.update(
          data,
          Number(eventId)
        );
        if (createResult.status === 200) {
          showNotification("Task details updated", {
            type: "success",
          });
          if (onSave) {
            onSave();
          }
        }
      } else {
        const createResult = await taskEventService.create(data);
        if (createResult.status === 201) {
          showNotification("Task details inserted", {
            type: "success",
          });
          if (onSave) {
            onSave();
          }
        }
      }
    } catch (e: any) {
      const error = getAxiosError(e);
      const message =
        error?.response?.status === 422
          ? error.response.data?.toString()
          : COMMON_ERROR_MESSAGE;
      showNotification(message, {
        type: "error",
      });
    }
  };

  const daysOnChangeHandler = (event: SyntheticEvent) => {
    (endDateRef?.current as any)["value"] = dateUtils.formatDate(
      dateUtils
        .add(
          String((startDateRef?.current as any)["value"]),
          Number((event.target as any)["value"]),
          "days"
        )
        .toISOString()
    );
  };

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="task-form"
          container
          sx={{
            margin: 0,
            width: "100%",
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              backgroundColor: Palette.neutral.bg.light,
              padding: "24px 40px",
            }}
          >
            <Grid item xs={12}>
              <ETFormLabel required>Task Title</ETFormLabel>
              <TextField
                fullWidth
                placeholder="Title"
                defaultValue={taskEvent?.name}
                error={!!errors?.name?.message}
                helperText={errors?.name?.message?.toString()}
                {...register("name")}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>Start Date</ETFormLabel>
              <Controller
                name="start_date"
                control={control}
                defaultValue={Moment(taskEvent?.start_date).format()}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format={DATE_FORMAT}
                      slotProps={{
                        textField: {
                          id: "start_date",
                          fullWidth: true,
                          inputRef: startDateRef,
                          error: error ? true : false,
                          helperText: error?.message,
                          placeholder: "MM-DD-YYYY",
                        },
                        ...register("start_date"),
                      }}
                      value={dayjs(value)}
                      onChange={(event) => {
                        onChange(event);
                      }}
                      defaultValue={dayjs(
                        taskEvent?.start_date ? taskEvent?.start_date : ""
                      )}
                      sx={{ display: "block" }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>Days</ETFormLabel>
              <TextField
                fullWidth
                defaultValue={taskEvent?.number_of_days}
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                type="number"
                {...register("number_of_days")}
                onChange={daysOnChangeHandler}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel required>End Date</ETFormLabel>
              <TextField
                fullWidth
                disabled
                placeholder="MM-DD-YYYY"
                inputRef={endDateRef}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel required>Status</ETFormLabel>
              <ControlledSelectV2
                helperText={errors?.status?.message?.toString()}
                defaultValue={taskEvent?.status}
                options={statuses || []}
                getOptionValue={(o: any) => o?.value.toString()}
                getOptionLabel={(o: any) => o.label}
                {...register("status")}
              ></ControlledSelectV2>
            </Grid>
          </Grid>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              padding: "0px 40px 16px 40px",
              mt: 0,
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <Grid item xs={6}>
              <ETFormLabel>Assigned</ETFormLabel>
              <ControlledSelectV2
                isMulti={true}
                defaultValue={taskEvent?.assignee_ids?.map((p) => parseInt(p))}
                options={assignees || []}
                getOptionValue={(o: Staff) => o?.id.toString()}
                getOptionLabel={(o: Staff) => o.full_name}
                {...register("assignee_ids")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Responsibility</ETFormLabel>
              <ControlledSelectV2
                defaultValue={taskEvent?.responsibility_id}
                options={responsibilities || []}
                getOptionValue={(o: ListType) => o?.id.toString()}
                getOptionLabel={(o: ListType) => o.name}
                {...register("responsibility_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel>Notes</ETFormLabel>
              <RichTextEditor
                handleEditorStateChange={setNotes}
                initialRawEditorState={taskEvent?.notes}
              />
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default TaskForm;
