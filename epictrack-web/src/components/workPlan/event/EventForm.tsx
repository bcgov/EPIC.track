import React from "react";
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
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { ListType } from "../../../models/code";
import RichTextEditor from "../../shared/richTextEditor";
import eventService from "../../../services/eventService/eventService";
import { MilestoneEvent } from "../../../models/events";
import configurationService from "../../../services/configurationService/configurationService";
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  event_configuration_id: yup.string().required("Please select milestone type"),
  anticipated_date: yup.string().required("Please select start date"),
});

interface TaskFormProps {
  onSave: () => void;
  eventId?: number;
}
const EventForm = ({ onSave, eventId }: TaskFormProps) => {
  const [event, setEvent] = React.useState<MilestoneEvent>();
  const [configurations, setConfigurations] = React.useState<ListType[]>([]);
  const [notes, setNotes] = React.useState("");
  const ctx = React.useContext(WorkplanContext);
  const workId = React.useMemo(() => ctx.work?.id, [ctx.work?.id]);
  const selectedPhaseId = React.useMemo(
    () => ctx.selectedPhase?.phase_id,
    [ctx.selectedPhase?.phase_id]
  );
  const endDateRef = React.useRef();
  const startDateRef = React.useRef();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: event,
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
    if (eventId) {
      getEvent();
    }
  }, [eventId]);

  React.useEffect(() => {
    reset(event);
  }, [event]);

  React.useEffect(() => {
    getConfigurations();
  }, []);

  const getConfigurations = async () => {
    try {
      const result = await configurationService.getAll(
        Number(workId),
        Number(selectedPhaseId),
        eventId === undefined ? false : undefined
      );
      if (result.status === 200) {
        const configurations = (result.data as any[]).map((p) => ({
          name: p.name,
          id: p.id,
        }));
        setConfigurations(configurations);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getEvent = async () => {
    try {
      const result = await eventService.getById(Number(eventId));
      if (result.status === 200) {
        // const assignee_ids: any[] = (result.data as any)["assignees"].map(
        //   (p: any) => p["assignee_id"]
        // );
        const taskEvent = result.data as MilestoneEvent;
        // (endDateRef?.current as any)["value"] = dateUtils.formatDate(
        //   dateUtils
        //     .add(taskEvent.start_date, taskEvent.number_of_days, "days")
        //     .toISOString()
        // );
        setEvent(taskEvent);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const onSubmitHandler = async (data: MilestoneEvent) => {
    try {
      data.anticipated_date = Moment(data.anticipated_date).format();
      if (!!data.actual_date) {
        data.actual_date = Moment(data.actual_date).format();
      }
      data.number_of_days = !!data.number_of_days ? 0 : data.number_of_days;
      data.notes = notes;
      if (eventId) {
        const createResult = await eventService.update(data, Number(eventId));
        if (createResult.status === 200) {
          showNotification("Milestone details updated", {
            type: "success",
          });
          if (onSave) {
            onSave();
          }
        }
      } else {
        const createResult = await eventService.create(
          data,
          Number(ctx.work?.id),
          Number(ctx.selectedPhase?.phase_id)
        );
        if (createResult.status === 201) {
          showNotification("Milestone details inserted", {
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

  //   const daysOnChangeHandler = (event: SyntheticEvent) => {
  //     (endDateRef?.current as any)["value"] = dateUtils.formatDate(
  //       dateUtils
  //         .add(
  //           String((startDateRef?.current as any)["value"]),
  //           Number((event.target as any)["value"]),
  //           "days"
  //         )
  //         .toISOString()
  //     );
  //   };

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="event-form"
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
              <ETFormLabel required>Title</ETFormLabel>
              <TextField
                fullWidth
                placeholder="Title"
                defaultValue={event?.name}
                error={!!errors?.name?.message}
                helperText={errors?.name?.message?.toString()}
                {...register("name")}
              />
            </Grid>
            <Grid item xs={10}>
              <ETFormLabel required>Milestone Type</ETFormLabel>
              <ControlledSelectV2
                helperText={errors?.event_configuration_id?.message?.toString()}
                defaultValue={event?.event_configuration_id}
                options={configurations || []}
                getOptionValue={(o: ListType) => o.id.toString()}
                getOptionLabel={(o: ListType) => o.name}
                {...register("event_configuration_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel required>Anticipated Date</ETFormLabel>
              <Controller
                name="anticipated_date"
                control={control}
                defaultValue={Moment(event?.anticipated_date).format()}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format={DATE_FORMAT}
                      slotProps={{
                        textField: {
                          id: "anticipated_date",
                          fullWidth: true,
                          error: error ? true : false,
                          helperText: error?.message,
                          placeholder: "MM-DD-YYYY",
                        },
                        ...register("anticipated_date"),
                      }}
                      value={dayjs(value)}
                      onChange={(event) => {
                        onChange(event);
                      }}
                      defaultValue={dayjs(
                        event?.anticipated_date ? event?.anticipated_date : ""
                      )}
                      sx={{ display: "block" }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Actual Date</ETFormLabel>
              <Controller
                name="actual_date"
                control={control}
                // defaultValue={Moment(event?.actual_date).format()}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format={DATE_FORMAT}
                      slotProps={{
                        textField: {
                          id: "actual_date",
                          fullWidth: true,
                          error: error ? true : false,
                          helperText: error?.message,
                          placeholder: "MM-DD-YYYY",
                        },
                        ...register("actual_date"),
                      }}
                      // value={dayjs(value)}
                      onChange={(event) => {
                        onChange(event);
                      }}
                      // defaultValue={dayjs(
                      //   event?.actual_date ? event?.actual_date : ""
                      // )}
                      sx={{ display: "block" }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel>Short Description</ETFormLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                error={!!errors?.short_description?.message}
                helperText={errors?.short_description?.message?.toString()}
                {...register("short_description")}
              />
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel>Long Description</ETFormLabel>
              <TextField
                fullWidth
                multiline
                rows={5}
                error={!!errors?.long_description?.message}
                helperText={errors?.long_description?.message?.toString()}
                {...register("long_description")}
              />
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
            <Grid item xs={12}>
              <ETFormLabel>Notes</ETFormLabel>
              <RichTextEditor
                handleEditorStateChange={setNotes}
                initialRawEditorState={event?.notes}
              />
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default EventForm;
