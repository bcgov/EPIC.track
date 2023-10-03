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
import TrackDialog from "../../shared/TrackDialog";
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
  const [submittedEvent, setSubmittedEvent] = React.useState<MilestoneEvent>();
  const [configurations, setConfigurations] = React.useState<ListType[]>([]);
  const [notes, setNotes] = React.useState("");
  const [showEventLockDialog, setShowEventLockDialog] =
    React.useState<boolean>(false);
  const ctx = React.useContext(WorkplanContext);
  const workId = React.useMemo(() => ctx.work?.id, [ctx.work?.id]);
  const selectedPhaseId = React.useMemo(
    () => ctx.selectedWorkPhase?.phase.id,
    [ctx.selectedWorkPhase?.phase.id]
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
        const taskEvent = result.data as MilestoneEvent;
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
      setSubmittedEvent(data);
      const showConfirmDialog =
        (event === undefined && data.actual_date != null) ||
        (event != null &&
          event.actual_date == null &&
          data.actual_date != null);
      if (!showConfirmDialog) {
        saveEvent(data);
      }
      setShowEventLockDialog(showConfirmDialog);
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

  const saveEvent = React.useCallback(
    async (data?: MilestoneEvent) => {
      const dataToBeSubmitted = data || submittedEvent;
      if (eventId) {
        const createResult = await eventService.update(
          dataToBeSubmitted,
          Number(eventId)
        );
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
          dataToBeSubmitted,
          Number(ctx.selectedWorkPhase?.id)
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
    },
    [eventId, submittedEvent]
  );

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
            spacing={2}
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
                disabled={!!eventId}
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
                      value={dayjs(value)}
                      onChange={(event) => {
                        onChange(event);
                      }}
                      defaultValue={dayjs(
                        event?.actual_date ? event?.actual_date : ""
                      )}
                      sx={{ display: "block" }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel>Description</ETFormLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                error={!!errors?.description?.message}
                helperText={errors?.description?.message?.toString()}
                {...register("description")}
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
        <TrackDialog
          open={showEventLockDialog}
          dialogTitle="Lock Milestone?"
          dialogContentText="The event will be locked. Do you want to continue?"
          disableEscapeKeyDown
          fullWidth
          okButtonText="Save"
          onOk={() => saveEvent()}
          onCancel={() => {
            setShowEventLockDialog(false);
          }}
          isActionsRequired
        />
      </FormProvider>
    </>
  );
};

export default EventForm;
