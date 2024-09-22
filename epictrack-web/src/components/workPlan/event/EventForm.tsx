import {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import Moment from "moment";
import {
  COMMON_ERROR_MESSAGE,
  MIN_WORK_START_DATE,
} from "../../../constants/application-constant";
import { Box, FormControlLabel, Grid, TextField, Tooltip } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { ListType } from "../../../models/code";
import RichTextEditor from "../../shared/richTextEditor";
import eventService from "../../../services/eventService/eventService";
import {
  EventCategory,
  EventPosition,
  EventTemplateVisibility,
  EventType,
  EventsGridModel,
  MilestoneEvent,
  MilestoneEventDateCheck,
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
import { Else, If, Then, When } from "react-if";
import ExtensionInput from "./components/ExtensionInput";
import { EventContext } from "./EventContext";
import { EVENT_TYPE } from "../phase/type";
import ExtensionSuspensionInput from "./components/ExtensionSuspensionInput";
import WarningBox from "../../shared/warningBox";
import EventDatePushConfirmForm from "./components/EventDatePushConfirmForm";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import { Staff } from "models/staff";
import staffService from "services/staffService/staffService";
import { OUTCOME_ID } from "./constants";

interface EventFormProps {
  onSave: () => void;
  event?: MilestoneEvent;
  milestoneEvents: EventsGridModel[];
  isFormFieldsLocked: boolean;
}
interface NumberOfDaysChangeProps {
  numberOfDays?: number | undefined;
  anticipatedDate?: string | undefined;
  actualDate?: string | undefined;
}
const InfoIcon: React.FC<IconProps> = Icons["InfoIcon"];
const EventForm = ({
  onSave = () => {
    return;
  },
  event,
  milestoneEvents,
  isFormFieldsLocked,
}: EventFormProps) => {
  const [configurations, setConfigurations] = useState<EventConfiguration[]>(
    []
  );
  const [notes, setNotes] = useState("");
  const [titleCharacterCount, setTitleCharacterCount] = useState<number>(0);
  const [showEventLockDialog, setShowEventLockDialog] =
    useState<boolean>(false);
  const [selectedConfiguration, setSelectedConfiguration] =
    useState<EventConfiguration>();
  const anticipatedDateRef = useRef();
  const numberOfDaysRef = useRef();
  const endDateRef = useRef();
  const [showEventPushConfirmation, setShowEventPushConfirmation] =
    useState(false);
  const [pushEvents, setPushEvents] = useState<boolean>(false);
  const initialNotes = useMemo(() => event?.notes, [event?.id]);
  const { handleHighlightRows } = useContext(EventContext);
  const [dateCheckStatus, setDateCheckStatus] =
    useState<MilestoneEventDateCheck>();
  const [actualAdded, setActualAdded] = useState<boolean>(false);
  const [anticipatedLabel, setAnticipatedLabel] = useState("Anticipated Date");
  const [actualDateLabel, setActualDateLabel] = useState("Actual Date");
  const isCreateMode = useMemo(() => !event, [event]);
  const [decisionMakers, setDecisionMakers] = useState<Staff[]>([]);
  const titleRef = useRef();
  const { selectedWorkPhase, work, workPhases } = useContext(WorkplanContext);
  const MISSING_RESUMPTION_ERROR =
    "No resumption milestone configuration found to resume the phase";
  const schema = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required("Name is required"),
        event_configuration_id: yup
          .string()
          .required("Please select milestone type"),
        anticipated_date: yup.string().required("Please select start date"),
        number_of_days: yup.string().when([], {
          is: () =>
            selectedConfiguration?.multiple_days === true ||
            selectedConfiguration?.event_category_id ===
              EventCategory.EXTENSION,
          then: () => yup.string().required("Number of days is required"),
          otherwise: () => yup.string().nullable(),
        }),
        [OUTCOME_ID]: yup.string().when([], {
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
        act_section_id: yup.string().when([], {
          is: () =>
            selectedConfiguration?.event_category_id ===
              EventCategory.EXTENSION ||
            selectedConfiguration?.event_type_id ===
              EventType.TIME_LIMIT_SUSPENSION,
          then: () => yup.string().required("Please select the act section"),
          otherwise: () => yup.string().nullable(),
        }),
      }),
    [selectedConfiguration, actualAdded]
  );
  const disableAnticipatedDate = useMemo(
    () =>
      isFormFieldsLocked ||
      Boolean(
        selectedConfiguration?.id &&
          selectedWorkPhase?.work_phase.legislated &&
          selectedConfiguration?.event_position === EventPosition.END
      ),
    [selectedConfiguration, selectedWorkPhase]
  );
  const pushRequired = useMemo(
    () =>
      dateCheckStatus?.subsequent_event_push_required &&
      event?.event_configuration.event_category_id !== EventCategory.EXTENSION,
    [dateCheckStatus, event]
  );
  const isHighPriorityActive = useMemo(() => {
    if (event) {
      return event.high_priority;
    }
    if (
      [
        EventType.TIME_LIMIT_SUSPENSION,
        EventType.TIME_LIMIT_RESUMPTION,
      ].includes(Number(selectedConfiguration?.event_type_id))
    ) {
      return true;
    }
  }, [selectedConfiguration, event]);
  /**
   * If the event is the last decision event, then, the decision maker
   * position id has to be selected from the decision make position id
   * stored in Work model
   */
  const decisionMakerPositionIds = useMemo<number[]>(() => {
    const lastDecisionIndex = milestoneEvents.findLastIndex(
      (p: EventsGridModel) =>
        p.event_configuration.event_category_id === EventCategory.DECISION
    );
    const currentEventIndex = milestoneEvents.findIndex(
      (p: EventsGridModel) => p.id === event?.id
    );
    if (
      selectedWorkPhase?.is_last_phase &&
      lastDecisionIndex === currentEventIndex
    ) {
      if (work?.decision_maker_position_id) {
        return [Number(work?.decision_maker_position_id)];
      } else {
        return [];
      }
    }
    return [
      POSITION_ENUM.EXECUTIVE_PROJECT_DIRECTOR,
      POSITION_ENUM.ASSOCIATE_DEPUTY_MINISTER,
      POSITION_ENUM.ADM,
      POSITION_ENUM.PROJECT_ASSESSMENT_DIRECTOR,
    ];
  }, [work, workPhases, selectedWorkPhase, event, milestoneEvents]);
  const getDecisionMakers = useCallback(async () => {
    if (!decisionMakerPositionIds || decisionMakerPositionIds.length === 0) {
      const result = await staffService.getById(String(work?.decision_by_id));
      if (result.status === 200) {
        setDecisionMakers([result.data as Staff]);
      }
    } else {
      const result = await staffService.getStaffByPosition(
        decisionMakerPositionIds.join(",")
      );
      if (result.status === 200) {
        setDecisionMakers(result.data as Staff[]);
      }
    }
  }, [decisionMakerPositionIds, work]);
  useEffect(() => {
    if (
      actualAdded &&
      selectedConfiguration?.event_category_id === EventCategory.DECISION
    ) {
      getDecisionMakers();
    }
  }, [actualAdded, selectedConfiguration]);
  const showDatePushWarning = useMemo(
    () =>
      dateCheckStatus?.phase_end_push_required &&
      selectedWorkPhase?.work_phase.legislated &&
      selectedConfiguration?.event_category_id !== EventCategory.EXTENSION,
    [dateCheckStatus, selectedWorkPhase]
  );
  const isMilestoneTypeDisabled = useMemo(
    () =>
      !!event ||
      isFormFieldsLocked ||
      selectedWorkPhase?.work_phase.is_suspended,
    [event, selectedWorkPhase?.work_phase.is_suspended]
  );
  const isTitleDisabled = useMemo(
    () => isFormFieldsLocked || selectedWorkPhase?.work_phase.is_suspended,
    [isFormFieldsLocked, selectedWorkPhase?.work_phase.is_suspended]
  );

  const isStartPhase = useMemo(
    () =>
      workPhases.findIndex(
        (p) => p.work_phase.id === selectedWorkPhase?.work_phase.id
      ) === 0,
    [workPhases, selectedWorkPhase]
  );

  const isStartEvent = useMemo(
    () =>
      event &&
      selectedConfiguration &&
      selectedConfiguration?.event_position === EventPosition.START,
    [event, selectedConfiguration]
  );

  const anticipatedDefaultValue = useMemo(() => {
    return event
      ? event.anticipated_date
      : selectedWorkPhase?.work_phase.start_date;
  }, [event, selectedWorkPhase]);

  const actualReferenceDate = useMemo(() => {
    return event ? event.anticipated_date : anticipatedDefaultValue;
  }, [event, anticipatedDefaultValue]);
  const anticipatedMinDate = useMemo(
    () =>
      isStartEvent && isStartPhase
        ? dayjs(MIN_WORK_START_DATE)
        : dayjs(work?.start_date),
    [work?.start_date, isStartEvent, isStartPhase]
  );
  const actualDateMin = useMemo(
    () =>
      isStartEvent && isStartPhase
        ? dayjs(MIN_WORK_START_DATE)
        : dayjs(selectedWorkPhase?.work_phase.start_date),
    [selectedWorkPhase, isStartEvent, isStartPhase]
  );
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: event,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    unregister,
    formState: { errors },
    reset,
    control,
    getValues,
  } = methods;

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (configurations && event) {
      const config = configurations.filter(
        (p) => p.id == event.event_configuration_id
      )[0];
      setSelectedConfiguration(config);
    }
  }, [event, configurations]);

  /**
   * If the phase is suspended, the, when you try to add a new event
   * the form should be pre set with RESUMPTION milestone type
   */
  useEffect(() => {
    if (
      selectedWorkPhase?.work_phase.is_suspended &&
      configurations.length > 0 &&
      !event
    ) {
      const config = configurations.filter(
        (p) => p.event_type_id == EventType.TIME_LIMIT_RESUMPTION
      );
      if (!config || config.length === 0) {
        showNotification(MISSING_RESUMPTION_ERROR, {
          type: "warning",
        });
      } else {
        setSelectedConfiguration(config[0]);
        reset({
          event_configuration_id: config[0].id,
          name: config[0].name,
        });
      }
    }
  }, [configurations, event]);

  useEffect(() => {
    if (!Boolean(event)) {
      getConfigurations();
    } else if (event) {
      setConfigurations([(event as MilestoneEvent).event_configuration]);
    }
  }, [event]);

  const getConfigurations = async () => {
    try {
      const result = await configurationService.getAll(
        Number(selectedWorkPhase?.work_phase.id),
        [EventTemplateVisibility.OPTIONAL, EventTemplateVisibility.SUGGESTED]
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

  /**
   * Check if the selected event configuration cause date to exceed the phase
   * or push subsequent events
   */
  const eventDateCheck = async () => {
    try {
      const result = await eventService.check_event_for_date_push(
        getValues(),
        event?.id
      );
      if (result.status === 200) {
        setDateCheckStatus(result.data as MilestoneEventDateCheck);
      }
    } catch (e) {}
  };

  /**
   * Check if it is required to show the Lock confirmation
   * @param submittedData Submitted event data from the form
   * @returns true if DateLock Confirm dialog to be shown
   */
  const showLockConfirmDialog = (submittedData: MilestoneEvent) =>
    (isCreateMode && !!submittedData.actual_date) ||
    (!isCreateMode && !event?.actual_date && !!submittedData.actual_date);

  const onSubmitHandler = async (submittedData: MilestoneEvent) => {
    try {
      if (pushRequired) {
        setShowEventPushConfirmation(pushRequired);
      } else if (showLockConfirmDialog(submittedData)) {
        setShowEventLockDialog(showLockConfirmDialog(submittedData));
        setShowEventPushConfirmation(false);
      } else {
        handleSaveEvent(submittedData);
      }
    } catch (e: any) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const createEvent = useCallback(
    async (data: MilestoneEvent, pushEventConfirmed: boolean) => {
      const createdResult = await eventService.create(
        data,
        Number(selectedWorkPhase?.work_phase.id),
        pushEvents || pushEventConfirmed
      );
      showNotification("Milestone details inserted", {
        type: "success",
      });
      handleHighlightRows([
        {
          type: EVENT_TYPE.MILESTONE,
          id: createdResult.data.id,
        },
      ]);

      return createdResult;
    },
    [pushEvents]
  );

  const updateEvent = useCallback(
    async (data: MilestoneEvent, pushEventConfirmed: boolean) => {
      if (!event) {
        return;
      }

      const updatedResult = await eventService.update(
        data,
        Number(event.id),
        pushEvents || pushEventConfirmed
      );
      showNotification("Milestone details updated", {
        type: "success",
      });
      handleHighlightRows([
        {
          type: EVENT_TYPE.MILESTONE,
          id: event.id,
        },
      ]);
      return updatedResult;
    },
    [event, pushEvents]
  );

  const saveEvent = useCallback(
    (data: MilestoneEvent, pushEventConfirmed: boolean) => {
      if (event) {
        return updateEvent(data, pushEventConfirmed);
      }

      return createEvent(data, pushEventConfirmed);
    },
    [event, pushEvents]
  );
  const handleSaveEvent = async (
    data?: MilestoneEvent,
    pushEventConfirmed = false,
    confirmSaveInLocked = false
  ) => {
    pushEventConfirmed =
      pushEventConfirmed ||
      event?.event_configuration.event_category_id === EventCategory.EXTENSION;
    try {
      const formData = data ?? getValues();
      const dataToBeSubmitted = {
        ...formData,
        notes: notes,
      };
      pushEventConfirmed =
        pushEventConfirmed ||
        (event?.event_configuration.event_category_id ===
          EventCategory.EXTENSION &&
          !!dataToBeSubmitted?.actual_date);
      if (showLockConfirmDialog(dataToBeSubmitted) && !confirmSaveInLocked) {
        setShowEventLockDialog(true);
      } else {
        dataToBeSubmitted.anticipated_date = Moment(
          dataToBeSubmitted.anticipated_date
        ).format();
        if (!!dataToBeSubmitted.actual_date) {
          dataToBeSubmitted.actual_date = Moment(
            dataToBeSubmitted.actual_date
          ).format();
        }
        await saveEvent(dataToBeSubmitted, pushEventConfirmed);
        onSave();
        setDateCheckStatus(undefined);
      }
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const onChangeMilestoneType = (configuration_id: number) => {
    const configuration = configurations.filter(
      (p) => p.id === Number(configuration_id)
    )[0];
    setSelectedConfiguration(configuration);
    (titleRef?.current as any)["value"] = configuration.name;
    setTitleCharacterCount(Number(configuration.name.length));
    (titleRef?.current as any).focus();
    unregisterOptionalFields();
    return Promise.resolve();
  };

  /**
   * Unregister various fields which might have already loaded
   * based on different milestone type. This is required or else
   * such hidden fields would be submitted to the server
   */
  const unregisterOptionalFields = () => {
    unregister("decision_maker_id");
    unregister("outcome_id");
    unregister("number_of_days");
    unregister("act_section_id");
    unregister("reason");
    unregister("number_of_days");
    unregister("number_of_responses");
    unregister("topic");
    unregister("number_of_attendees");
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
    return Promise.resolve();
  };
  const changeHandler = async (params?: NumberOfDaysChangeProps) => {
    await daysOnChangeHandler(params);
    eventDateCheck();
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
              px: 0,
              pt: 1,
              pb: 3,
            }}
          >
            <Grid item xs={12}>
              <ETFormLabel required>Milestone Type</ETFormLabel>
              <ControlledSelectV2
                helperText={errors?.event_configuration_id?.message?.toString()}
                defaultValue={event?.event_configuration_id}
                options={configurations || []}
                getOptionValue={(o: ListType) => o.id.toString()}
                getOptionLabel={(o: ListType) => o.name}
                disabled={isMilestoneTypeDisabled}
                onHandleChange={async (configuration_id) => {
                  await onChangeMilestoneType(configuration_id);
                  eventDateCheck();
                }}
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
                disabled={isTitleDisabled}
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
                      disabled={isFormFieldsLocked}
                      name="high_priority"
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
              <ControlledDatePicker
                name="anticipated_date"
                disabled={disableAnticipatedDate}
                defaultValue={dayjs(anticipatedDefaultValue).format()}
                datePickerProps={{
                  referenceDate: dayjs(
                    selectedWorkPhase?.work_phase.start_date
                  ),
                  minDate: anticipatedMinDate,
                  onDateChange: (event: any, defaultOnChange: any) => {
                    const d = event ? event["$d"] : null;
                    defaultOnChange(d);
                    changeHandler({
                      anticipatedDate: d,
                    });
                  },
                }}
                datePickerSlotProps={{
                  inputRef: anticipatedDateRef,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>{actualDateLabel}</ETFormLabel>
              <ControlledDatePicker
                name="actual_date"
                disabled={isFormFieldsLocked}
                defaultValue={
                  event?.actual_date ? dayjs(event?.actual_date).format() : ""
                }
                datePickerProps={{
                  referenceDate: dayjs(actualReferenceDate),
                  minDate: actualDateMin,
                  maxDate: dayjs(new Date()),
                  onDateChange: (event: any, defaultOnChange: any) => {
                    const d = event ? event["$d"] : null;
                    defaultOnChange(d);
                    changeHandler({
                      actualDate: d,
                    });
                  },
                }}
              />
            </Grid>
            <When condition={showDatePushWarning}>
              <Grid item xs={12}>
                <WarningBox
                  title="Selecting this date will extend subsequent Milestones beyond the legislated time limit. You might need to add an Extension Milestone to complete the Phase."
                  isTitleBold={false}
                />
              </Grid>
            </When>
          </Grid>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              px: 1,
              pt: 1,
              pb: 0,
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
                <ExtensionInput
                  isFormFieldsLocked={isFormFieldsLocked}
                  onChangeDay={eventDateCheck}
                />
              </Then>
              <Else>
                <When condition={selectedConfiguration?.multiple_days}>
                  <MultiDaysInput
                    endDateRef={endDateRef}
                    isFormFieldsLocked={isFormFieldsLocked}
                    numberOfDaysRef={numberOfDaysRef}
                    onChangeDay={changeHandler}
                  />
                </When>
              </Else>
            </If>
            <When
              condition={
                selectedConfiguration?.event_category_id ===
                  EventCategory.PCP &&
                ![EventType.OPEN_HOUSE, EventType.VIRTUAL_OPEN_HOUSE].includes(
                  selectedConfiguration?.event_type_id
                )
              }
            >
              <PCPInput />
            </When>
            <When
              condition={[
                EventType.OPEN_HOUSE,
                EventType.VIRTUAL_OPEN_HOUSE,
              ].includes(Number(selectedConfiguration?.event_type_id))}
            >
              <SingleDayPCPInput />
            </When>
            <When
              condition={
                actualAdded &&
                selectedConfiguration?.event_category_id ===
                  EventCategory.DECISION
              }
            >
              <DecisionInput
                isFormFieldsLocked={isFormFieldsLocked}
                configurationId={selectedConfiguration?.id}
                decisionMakers={decisionMakers}
              />
            </When>
            <When
              condition={
                selectedConfiguration?.event_type_id ===
                EventType.TIME_LIMIT_SUSPENSION
              }
            >
              <ExtensionSuspensionInput
                isFormFieldsLocked={isFormFieldsLocked}
              />
            </When>
            <Grid item xs={12}>
              <ETFormLabel>Notes</ETFormLabel>
              <RichTextEditor
                handleEditorStateChange={setNotes}
                initialRawEditorState={initialNotes}
              />
            </Grid>
          </Grid>
        </Grid>
        <TrackDialog
          open={showEventLockDialog}
          dialogTitle="Lock this Milestone?"
          dialogContentText="Entering an actual date will lock this Milestone. Once locked, you will only be able to edit the description and notes field."
          disableEscapeKeyDown
          fullWidth
          okButtonText="Yes"
          cancelButtonText="No"
          onOk={() => handleSaveEvent(undefined, pushEvents, true)}
          onCancel={() => {
            setShowEventLockDialog(false);
          }}
          isActionsRequired
        />
        <TrackDialog
          open={showEventPushConfirmation}
          dialogTitle={"Update this Milestone only?"}
          disableEscapeKeyDown
          fullWidth
          maxWidth="sm"
          okButtonText="Save"
          cancelButtonText="Cancel"
          isActionsRequired
          onCancel={() => setShowEventPushConfirmation(false)}
          formId="confirm-form"
        >
          <EventDatePushConfirmForm
            onSave={(option: number) => {
              setPushEvents((prevState) => {
                prevState = option === 1;
                handleSaveEvent(undefined, prevState);
                setShowEventPushConfirmation(false);
                return prevState;
              });
            }}
          />
        </TrackDialog>
      </FormProvider>
    </>
  );
};

export default EventForm;
