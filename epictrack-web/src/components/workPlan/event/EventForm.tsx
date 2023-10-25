import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Moment from "moment";
import {
  COMMON_ERROR_MESSAGE,
  DATE_FORMAT,
} from "../../../constants/application-constant";
import { Box, FormControlLabel, Grid, TextField, Tooltip } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { ListType } from "../../../models/code";
import RichTextEditor from "../../shared/richTextEditor";
import eventService from "../../../services/eventService/eventService";
import {
  EventCategory,
  EventType,
  MilestoneEvent,
} from "../../../models/event";
import configurationService from "../../../services/configurationService/configurationService";
import TrackDialog from "../../shared/TrackDialog";
import EventConfiguration from "../../../models/eventConfiguration";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import MultiDaysInput from "./components/MultiDaysInput";
import { dateUtils } from "../../../utils";
import PCPInput from "./components/PCPInput";
import Icons from "../../icons/index";
import { IconProps } from "../../icons/type";
import SingleDayPCPInput from "./components/SingleDayPCPInput";
import DecisionInput from "./components/DecisionInput";
import { POSITION_ENUM } from "../../../models/position";
import { Else, If, Then } from "react-if";
import ExtensionInput from "./components/ExtensionInput";

interface EventFormProps {
  onSave: () => void;
  event?: MilestoneEvent;
  isFormFieldsLocked: boolean;
}
interface NumberOfDaysChangeProps {
  numberOfDays?: number | undefined;
  anticipatedDate?: string | undefined;
  actualDate?: string | undefined;
}
const InfoIcon: React.FC<IconProps> = Icons["InfoIcon"];

const EventForm = ({ onSave, event, isFormFieldsLocked }: EventFormProps) => {
  const [submittedEvent, setSubmittedEvent] = React.useState<MilestoneEvent>();
  const [configurations, setConfigurations] = React.useState<
    EventConfiguration[]
  >([]);
  const [notes, setNotes] = React.useState("");
  const [titleCharacterCount, setTitleCharacterCount] =
    React.useState<number>(0);
  const [showEventLockDialog, setShowEventLockDialog] =
    React.useState<boolean>(false);
  const [selectedConfiguration, setSelectedConfiguration] =
    React.useState<EventConfiguration>();
  const anticipatedDateRef = React.useRef();
  const numberOfDaysRef = React.useRef();
  const endDateRef = React.useRef();
  const ctx = React.useContext(WorkplanContext);
  const [actualAdded, setActualAdded] = React.useState<boolean>(false);
  const [anticipatedLabel, setAnticipatedLabel] =
    React.useState("Anticipated Date");
  const [actualDateLabel, setActualDateLabel] = React.useState("Actual Date");
  const titleRef = React.useRef();
  const schema = React.useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required("Name is required"),
        event_configuration_id: yup
          .string()
          .required("Please select milestone type"),
        anticipated_date: yup.string().required("Please select start date"),
        number_of_days: yup.string().when([], {
          is: () => selectedConfiguration?.multiple_days === true,
          then: () => yup.string().required("Number of days is required"),
          otherwise: () => yup.string().nullable(),
        }),
        outcome_id: yup.string().when([], {
          is: () =>
            actualAdded &&
            selectedConfiguration?.event_category_id === EventCategory.DECISION,
          then: () => yup.string().required("Please select the decision"),
          otherwise: () => yup.string().nullable(),
        }),
        decision_maker_id: yup.string().when([], {
          is: () =>
            actualAdded &&
            selectedConfiguration?.event_category_id === EventCategory.DECISION,
          then: () => yup.string().required("Please select the decision maker"),
          otherwise: () => yup.string().nullable(),
        }),
      }),
    [selectedConfiguration, actualAdded]
  );
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
    getValues,
  } = methods;

  React.useEffect(() => {
    if (
      selectedConfiguration &&
      selectedConfiguration.event_category_id === EventCategory.EXTENSION
    ) {
      setAnticipatedLabel("Anticipated Order Date");
      setActualDateLabel("Actual Order Date");
    } else if (selectedConfiguration && selectedConfiguration.multiple_days) {
      setAnticipatedLabel("Anticipated Start Date");
      setActualDateLabel("Actual Start Date");
    } else {
      setAnticipatedLabel("Anticipated Date");
      setActualDateLabel("Actual Date");
    }
  }, [selectedConfiguration]);
  React.useEffect(() => {
    if (event) {
      reset(event);
      daysOnChangeHandler({
        anticipatedDate: !event.actual_date
          ? undefined
          : event.anticipated_date,
        actualDate: event.actual_date ? event.actual_date : undefined,
        numberOfDays: event.number_of_days,
      });
      setTitleCharacterCount(Number(event?.name.length));
      setNotes(event.notes);
    }
  }, [
    event,
    numberOfDaysRef?.current,
    endDateRef?.current,
    anticipatedDateRef?.current,
  ]);

  React.useEffect(() => {
    if (configurations && event) {
      const config = configurations.filter(
        (p) => p.id == event.event_configuration_id
      )[0];
      setSelectedConfiguration(config);
    }
  }, [event, configurations]);

  React.useEffect(() => {
    getConfigurations();
  }, [event]);

  const getConfigurations = async () => {
    try {
      const result = await configurationService.getAll(
        Number(ctx.selectedWorkPhase?.id),
        event === undefined ? false : undefined
      );
      if (result.status === 200) {
        setConfigurations(result.data as any[]);
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
      data.notes = notes;
      // setSubmittedEvent(data);
      const showConfirmDialog =
        (event === undefined && !!data.actual_date) ||
        (event != null && event.actual_date == null && !!data.actual_date);
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
      const dataToBeSubmitted = data || getValues();
      if (event) {
        const createResult = await eventService.update(
          dataToBeSubmitted,
          Number(event.id)
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
    [event, submittedEvent]
  );

  const onChangeMilestoneType = (configuration_id: number) => {
    const configuration = configurations.filter(
      (p) => p.id === Number(configuration_id)
    )[0];
    setSelectedConfiguration(configuration);
    (titleRef?.current as any)["value"] = configuration.name;
    setTitleCharacterCount(Number(configuration.name.length));
    (titleRef?.current as any).focus();
  };

  const onChangeTitle = (event: any) => {
    setTitleCharacterCount(Number(event.target.value.length));
  };

  const daysOnChangeHandler = (params: NumberOfDaysChangeProps = {}) => {
    setActualAdded(!!params.actualDate);
    let number_of_days = 0;
    if (numberOfDaysRef?.current as any) {
      number_of_days =
        params.numberOfDays ||
        Number((numberOfDaysRef?.current as any)["value"]);
    }
    if (endDateRef?.current as any) {
      (endDateRef?.current as any)["value"] = dateUtils.formatDate(
        dateUtils
          .add(
            params.actualDate ||
              params.anticipatedDate ||
              String((anticipatedDateRef?.current as any)["value"]),
            number_of_days,
            "days"
          )
          .toISOString()
      );
    }
  };
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
            {JSON.stringify(errors)}
            <Grid item xs={12}>
              <ETFormLabel required>Milestone Type</ETFormLabel>
              <ControlledSelectV2
                helperText={errors?.event_configuration_id?.message?.toString()}
                defaultValue={event?.event_configuration_id}
                options={configurations || []}
                getOptionValue={(o: ListType) => o.id.toString()}
                getOptionLabel={(o: ListType) => o.name}
                disabled={!!event || isFormFieldsLocked}
                onHandleChange={(configuration_id) =>
                  onChangeMilestoneType(configuration_id)
                }
                {...register("event_configuration_id")}
              ></ControlledSelectV2>
            </Grid>
            <Grid item xs={12}>
              <ETFormLabelWithCharacterLimit
                characterCount={titleCharacterCount}
                maxCharacterLength={150}
              >
                Title
              </ETFormLabelWithCharacterLimit>
              <TextField
                fullWidth
                placeholder="Title"
                disabled={isFormFieldsLocked}
                defaultValue={event?.name}
                error={!!errors?.name?.message}
                inputRef={titleRef}
                inputProps={{
                  maxLength: 150,
                }}
                helperText={errors?.name?.message?.toString()}
                {...register("name")}
                onChange={onChangeTitle}
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
            <Grid item xs={12}>
              <Box>
                <FormControlLabel
                  sx={{
                    mr: "2px",
                  }}
                  disabled={isFormFieldsLocked}
                  control={
                    <ControlledSwitch
                      {...register("high_priority")}
                      defaultChecked={event?.high_priority}
                    />
                  }
                  label="High Priority"
                />
                <Tooltip title="High Priority Milestones will appear on reports">
                  <Box component={"span"}>
                    <InfoIcon />
                  </Box>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel required>{anticipatedLabel}</ETFormLabel>
              <Controller
                name="anticipated_date"
                control={control}
                defaultValue={Moment(event?.anticipated_date).format()}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs} for>
                    <DatePicker
                      disabled={isFormFieldsLocked}
                      format={DATE_FORMAT}
                      slotProps={{
                        textField: {
                          id: "anticipated_date",
                          fullWidth: true,
                          inputRef: anticipatedDateRef,
                          error: error ? true : false,
                          helperText: error?.message,
                          placeholder: "MM-DD-YYYY",
                        },
                        ...register("anticipated_date"),
                      }}
                      value={dayjs(value)}
                      onChange={(event: any) => {
                        const d = event ? event["$d"] : null;
                        onChange(d);
                        daysOnChangeHandler({
                          anticipatedDate: d,
                        });
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
              <ETFormLabel>{actualDateLabel}</ETFormLabel>
              <Controller
                name="actual_date"
                control={control}
                defaultValue={
                  event?.actual_date ? Moment(event?.actual_date).format() : ""
                }
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disabled={isFormFieldsLocked}
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
                      value={value ? dayjs(value) : value}
                      onChange={(event: any) => {
                        const d = event ? event["$d"] : null;
                        onChange(d);
                        daysOnChangeHandler({
                          actualDate: d,
                        });
                      }}
                      sx={{ display: "block" }}
                    />
                  </LocalizationProvider>
                )}
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
              backgroundColor: Palette.white,
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <If
              condition={
                selectedConfiguration?.event_category_id ===
                EventCategory.EXTENSION
              }
            >
              <Then>
                <ExtensionInput isFormFieldsLocked={isFormFieldsLocked} />
              </Then>
              <Else>
                <If condition={selectedConfiguration?.multiple_days}>
                  <MultiDaysInput
                    endDateRef={endDateRef}
                    isFormFieldsLocked={isFormFieldsLocked}
                    numberOfDaysRef={numberOfDaysRef}
                    onChangeDay={daysOnChangeHandler}
                  />
                </If>
              </Else>
            </If>
            {selectedConfiguration?.event_category_id === EventCategory.PCP &&
              ![EventType.OPEN_HOUSE, EventType.VIRTUAL_OPEN_HOUSE].includes(
                selectedConfiguration?.event_type_id
              ) && <PCPInput isFormFieldsLocked={isFormFieldsLocked} />}
            {[EventType.OPEN_HOUSE, EventType.VIRTUAL_OPEN_HOUSE].includes(
              Number(selectedConfiguration?.event_type_id)
            ) && <SingleDayPCPInput isFormFieldsLocked={isFormFieldsLocked} />}
            {actualAdded &&
              selectedConfiguration?.event_category_id ===
                EventCategory.DECISION && (
                <DecisionInput
                  isFormFieldsLocked={isFormFieldsLocked}
                  configurationId={selectedConfiguration.id}
                  decisionMakerPositionId={
                    ctx.work?.decision_maker_position_id ||
                    POSITION_ENUM.EXECUTIVE_PROJECT_DIRECTOR
                  }
                />
              )}
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
