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
import { Else, If, Then, When } from "react-if";
import { Box, FormControlLabel, Grid, TextField, Tooltip } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import RichTextEditor from "../../shared/richTextEditor";
import TrackDialog from "../../shared/TrackDialog";
import WarningBox from "../../shared/warningBox";
import { ETHeading4 } from "../../shared";
import { showNotification } from "../../shared/notificationProvider";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { WorkplanContext } from "../WorkPlanContext";
import { EventContext } from "./EventContext";
import {
  COMMON_ERROR_MESSAGE,
  MIN_WORK_START_DATE,
} from "../../../constants/application-constant";
import { EVENT_TYPE } from "../phase/type";
import { OUTCOME_ID } from "./constants";
import {
  DECISION_MAKER_POSITION_IDS,
  dateLabels,
  defaultAnticipatedDate,
  eventInputs,
  eventsApi,
  findResumptionConfiguration,
  isAnticipatedDateLocked,
  isPushPreconfirmed,
  isPushRequired,
  isStartEvent as isStartPositionEvent,
  isUnprocessableEventError,
  requiresActSection,
  requiresDecisionInputs,
  requiresNumberOfDays,
  showsDatePushWarning,
} from "api/events";
import { workPhasesApi } from "api/workPhases";
import staffService from "services/staffService/staffService";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { dateUtils } from "../../../utils";
import { ListType } from "models/code";
import { Staff } from "models/staff";
import {
  EventTemplateVisibility,
  EventsGridModel,
  MilestoneEvent,
  MilestoneEventDateCheck,
} from "models/event";
import EventConfiguration from "models/eventConfiguration";
import { WorkPhaseAdditionalInfo } from "../../../models/work";
import MultiDaysInput from "./components/MultiDaysInput";
import PCPInput from "./components/PCPInput";
import SingleDayPCPInput from "./components/SingleDayPCPInput";
import DecisionInput from "./components/DecisionInput";
import ExtensionInput from "./components/ExtensionInput";
import ExtensionSuspensionInput from "./components/ExtensionSuspensionInput";
import EventDatePushConfirmForm from "./components/EventDatePushConfirmForm";
import { Work, WorkPhase } from "models/work";

interface EventFormProps {
  onSave: (remainingPhasesToComplete?: boolean) => void;
  event?: MilestoneEvent;
  milestoneEvents?: EventsGridModel[];
  isFormFieldsLocked: boolean;
  workPhase?: WorkPhase;
  work?: Work;
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
  isFormFieldsLocked,
  workPhase: propWorkPhase,
  work: propWork,
}: EventFormProps) => {
  const [configurations, setConfigurations] = useState<EventConfiguration[]>(
    [],
  );
  const [notes, setNotes] = useState("");
  const [titleCharacterCount, setTitleCharacterCount] = useState<number>(0);
  const [showEventLockDialog, setShowEventLockDialog] =
    useState<boolean>(false);
  const [lockDialogError, setLockDialogError] = useState<string>("");
  const [selectedConfiguration, setSelectedConfiguration] =
    useState<EventConfiguration>();
  const anticipatedDateRef = useRef();
  const numberOfDaysRef = useRef();
  const endDateRef = useRef();
  const [showEventPushConfirmation, setShowEventPushConfirmation] =
    useState(false);
  const [pushEvents, setPushEvents] = useState<boolean>(false);
  const initialNotes = useMemo(() => event?.notes, [event?.notes]);
  const { handleHighlightRows } = useContext(EventContext);
  const [dateCheckStatus, setDateCheckStatus] =
    useState<MilestoneEventDateCheck>();
  const [actualAdded, setActualAdded] = useState<boolean>(
    event?.actual_date ? true : false,
  );
  const [anticipatedLabel, setAnticipatedLabel] = useState("Anticipated Date");
  const [actualDateLabel, setActualDateLabel] = useState("Actual Date");
  const isCreateMode = useMemo(() => !event, [event]);
  const [decisionMakers, setDecisionMakers] = useState<Staff[]>([]);
  const titleRef = useRef();
  const {
    work: contextWork,
    workPhases,
    selectedWorkPhase: contextSelectedWorkPhase,
  } = useContext(WorkplanContext);

  const work = propWork ?? contextWork;
  const selectedWorkPhase =
    propWorkPhase ?? contextSelectedWorkPhase?.work_phase;

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
          is: () => requiresNumberOfDays(selectedConfiguration),
          then: () => yup.string().required("Number of days is required"),
          otherwise: () => yup.string().nullable(),
        }),
        [OUTCOME_ID]: yup.string().when([], {
          is: () => requiresDecisionInputs(selectedConfiguration, actualAdded),
          then: () => yup.string().required("Please select the decision"),
          otherwise: () => yup.string().nullable(),
        }),
        decision_maker_id: yup.string().when([], {
          is: () => requiresDecisionInputs(selectedConfiguration, actualAdded),
          then: () => yup.string().required("Please select the decision maker"),
          otherwise: () => yup.string().nullable(),
        }),
        act_section_id: yup.string().when([], {
          is: () => requiresActSection(selectedConfiguration),
          then: () => yup.string().required("Please select the act section"),
          otherwise: () => yup.string().nullable(),
        }),
      }),
    [selectedConfiguration, actualAdded],
  );

  const [workPhaseAdditionalInfo, setWorkPhaseAdditionalInfo] =
    useState<WorkPhaseAdditionalInfo | null>(null);
  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      try {
        if (work?.id && selectedWorkPhase?.id) {
          const info = await workPhasesApi.getInfo(
            work.id,
            selectedWorkPhase.id,
          );
          setWorkPhaseAdditionalInfo(info ?? null);
        }
      } catch {
        console.error(`Failed to fetch work phase additional info`);
      }
    };
    fetchAdditionalInfo();
  }, [work?.id, selectedWorkPhase?.id]);

  const disableAnticipatedDate = useMemo(
    () =>
      isFormFieldsLocked ||
      isAnticipatedDateLocked(
        selectedConfiguration,
        selectedWorkPhase?.legislated,
        workPhaseAdditionalInfo?.milestone_progress,
      ),
    [
      isFormFieldsLocked,
      selectedConfiguration,
      workPhaseAdditionalInfo,
      selectedWorkPhase,
    ],
  );

  const pushRequired = useMemo(
    () => isPushRequired(dateCheckStatus, event),
    [dateCheckStatus, event],
  );

  const getDecisionMakers = useCallback(async () => {
    const result = await staffService.getActiveStaffByPosition(
      DECISION_MAKER_POSITION_IDS,
    );
    if (result.status === 200) {
      const decisionMakers = result.data as Staff[];
      if (work?.responsible_epd) {
        decisionMakers.push(work?.responsible_epd);
      }
      if (work?.work_lead) {
        decisionMakers.push(work?.work_lead);
      }
      if (work?.decision_by) {
        decisionMakers.unshift(work?.decision_by);
      }
      const uniqueDecisionMakers = [
        ...Array.from(
          new Map(
            decisionMakers.map((decisionMaker) => [
              decisionMaker.id,
              decisionMaker,
            ]),
          ).values(),
        ),
      ];
      setDecisionMakers(uniqueDecisionMakers);
    }
  }, [work]);

  useEffect(() => {
    if (requiresDecisionInputs(selectedConfiguration, actualAdded)) {
      getDecisionMakers();
    }
  }, [actualAdded, getDecisionMakers, selectedConfiguration]);

  const showDatePushWarning = useMemo(
    () =>
      showsDatePushWarning(
        dateCheckStatus,
        selectedWorkPhase?.legislated,
        selectedConfiguration,
      ),
    [dateCheckStatus, selectedConfiguration, selectedWorkPhase],
  );

  const inputs = useMemo(
    () => eventInputs(selectedConfiguration, actualAdded),
    [selectedConfiguration, actualAdded],
  );

  const isMilestoneTypeDisabled = useMemo(
    () => !!event || isFormFieldsLocked || selectedWorkPhase?.is_suspended,
    [event, isFormFieldsLocked, selectedWorkPhase?.is_suspended],
  );

  const isTitleDisabled = useMemo(
    () => isFormFieldsLocked || selectedWorkPhase?.is_suspended,
    [isFormFieldsLocked, selectedWorkPhase?.is_suspended],
  );

  const isStartPhase = useMemo(
    () =>
      workPhases.findIndex((p) => p.work_phase.id === selectedWorkPhase?.id) ===
      0,
    [workPhases, selectedWorkPhase],
  );

  const isStartEvent = useMemo(
    () =>
      event &&
      selectedConfiguration &&
      isStartPositionEvent(selectedConfiguration),
    [event, selectedConfiguration],
  );

  const anticipatedDefaultValue = useMemo(() => {
    if (event) return event.anticipated_date;
    return defaultAnticipatedDate(
      selectedConfiguration,
      selectedWorkPhase?.start_date,
    );
  }, [event, selectedWorkPhase, selectedConfiguration]);

  const actualReferenceDate = useMemo(() => {
    return event ? event.anticipated_date : anticipatedDefaultValue;
  }, [event, anticipatedDefaultValue]);
  const anticipatedMinDate = useMemo(
    () =>
      isStartEvent && isStartPhase
        ? dayjs(MIN_WORK_START_DATE)
        : dayjs(work?.start_date),
    [work?.start_date, isStartEvent, isStartPhase],
  );
  const actualDateMin = useMemo(
    () =>
      isStartEvent && isStartPhase
        ? dayjs(MIN_WORK_START_DATE)
        : dayjs(selectedWorkPhase?.start_date),
    [selectedWorkPhase, isStartEvent, isStartPhase],
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
    getValues,
    setValue,
  } = methods;

  useEffect(() => {
    if (anticipatedDefaultValue && !event) {
      // Only if there's no existing event
      setValue("anticipated_date", dayjs(anticipatedDefaultValue).format());
    }
  }, [anticipatedDefaultValue, event, setValue]);

  useEffect(() => {
    const labels = dateLabels(selectedConfiguration);
    setAnticipatedLabel(labels.anticipated);
    setActualDateLabel(labels.actual);
  }, [selectedConfiguration]);

  useEffect(() => {
    if (!event) return;
    const current = getValues();
    const hasChanged = JSON.stringify(current) !== JSON.stringify(event);
    if (hasChanged) {
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
  }, [event, getValues, reset]);

  useEffect(() => {
    if (configurations && event) {
      const config = configurations.filter(
        (p) => p.id === event.event_configuration_id,
      )[0];
      setSelectedConfiguration(config);
    }
  }, [configurations, event, setSelectedConfiguration]);

  /**
   * If the phase is suspended, when you try to add a new event
   * the form should be pre set with RESUMPTION milestone type
   */
  useEffect(() => {
    if (
      selectedWorkPhase?.is_suspended &&
      configurations.length > 0 &&
      !event
    ) {
      const resumption = findResumptionConfiguration(configurations);
      if (!resumption) {
        showNotification(MISSING_RESUMPTION_ERROR, {
          type: "warning",
        });
      } else {
        setSelectedConfiguration(resumption);
        reset({
          event_configuration_id: resumption.id,
          name: resumption.name,
        });
      }
    }
  }, [configurations, event, reset, selectedWorkPhase?.is_suspended]);

  const getConfigurations = useCallback(async () => {
    try {
      setConfigurations(
        await eventsApi.listConfigurations(Number(selectedWorkPhase?.id), [
          EventTemplateVisibility.OPTIONAL,
          EventTemplateVisibility.SUGGESTED,
        ]),
      );
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  }, [selectedWorkPhase]);

  useEffect(() => {
    if (!event) {
      getConfigurations();
    } else {
      setConfigurations([(event as MilestoneEvent).event_configuration]);
    }
  }, [event, getConfigurations]);

  /**
   * Check if the selected event configuration cause date to exceed the phase
   * or push subsequent events
   */
  const eventDateCheck = useCallback(async () => {
    try {
      setDateCheckStatus(await eventsApi.checkDatePush(getValues(), event?.id));
    } catch (e) {}
  }, [event?.id, getValues]);

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
      const created = await eventsApi.create(
        Number(selectedWorkPhase?.id),
        data,
        pushEvents || pushEventConfirmed,
      );
      showNotification("Milestone details inserted", {
        type: "success",
      });
      handleHighlightRows([
        {
          type: EVENT_TYPE.MILESTONE,
          id: created.id,
        },
      ]);

      return created;
    },
    [handleHighlightRows, pushEvents, selectedWorkPhase?.id],
  );

  const updateEvent = useCallback(
    async (data: MilestoneEvent, pushEventConfirmed: boolean) => {
      if (!event) {
        return;
      }
      const updated = await eventsApi.update(
        Number(event.id),
        data,
        pushEvents || pushEventConfirmed,
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
      return updated;
    },
    [event, handleHighlightRows, pushEvents],
  );

  const saveEvent = useCallback(
    (data: MilestoneEvent, pushEventConfirmed: boolean) => {
      if (event) {
        return updateEvent(data, pushEventConfirmed);
      }

      return createEvent(data, pushEventConfirmed);
    },
    [event, createEvent, updateEvent],
  );

  const handleSaveEvent = async (
    data?: MilestoneEvent,
    pushEventConfirmed = false,
    confirmSaveInLocked = false,
  ) => {
    pushEventConfirmed = pushEventConfirmed || isPushPreconfirmed(event);
    try {
      const formData = data ?? getValues();
      const dataToBeSubmitted = {
        ...formData,
        notes: notes,
      };
      if (showLockConfirmDialog(dataToBeSubmitted) && !confirmSaveInLocked) {
        setShowEventLockDialog(true);
        setLockDialogError(""); // Clear any previous errors
      } else {
        await saveEvent(dataToBeSubmitted, pushEventConfirmed);
        const remainingPhasesToComplete = workPhases?.some(
          (phase) =>
            phase.work_phase.legislated && !phase.work_phase.is_completed,
        );
        onSave(remainingPhasesToComplete);
        setDateCheckStatus(undefined);
        setShowEventLockDialog(false);
        setLockDialogError("");
      }
    } catch (e: any) {
      const message = getErrorMessage(e);
      // If it's an UnprocessableEventError or UnprocessableEndEventError and the lock dialog is open, show error in dialog
      if (isUnprocessableEventError(e) && showEventLockDialog) {
        setLockDialogError(message);
        showNotification("Failed to update milestone details", {
          type: "error",
          duration: 3000,
        });
        return;
      } else {
        // Otherwise show in snackbar
        showNotification(message, {
          duration: 3000,
          type: "error",
        });
      }
    }
  };

  const onChangeMilestoneType = (configuration_id: number) => {
    const configuration = configurations.filter(
      (p) => p.id === Number(configuration_id),
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
            "days",
          )
          .toISOString(),
      );
    }
    return Promise.resolve();
  };

  const changeHandler = useCallback(
    async (params?: NumberOfDaysChangeProps) => {
      await daysOnChangeHandler(params);
      eventDateCheck();
    },
    [eventDateCheck],
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
                onHandleChange={async (configuration_id: any) => {
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
                  label="High Profile"
                />
                <Tooltip title="High Profile Milestones will appear on reports">
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
                  referenceDate: dayjs(selectedWorkPhase?.start_date),
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
            item
            xs={12}
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              padding: "0.5rem 0.5rem 0 0",
              mt: 0,
              ml: 0,
              backgroundColor: Palette.white,
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <If condition={inputs.extension}>
              <Then>
                <ExtensionInput
                  isFormFieldsLocked={isFormFieldsLocked}
                  onChangeDay={eventDateCheck}
                />
              </Then>
              <Else>
                <When condition={inputs.multipleDays}>
                  <MultiDaysInput
                    endDateRef={endDateRef}
                    isFormFieldsLocked={isFormFieldsLocked}
                    numberOfDaysRef={numberOfDaysRef}
                    onChangeDay={changeHandler}
                  />
                </When>
              </Else>
            </If>
            <When condition={inputs.pcp}>
              <PCPInput />
            </When>
            <When condition={inputs.singleDayPcp}>
              <SingleDayPCPInput />
            </When>
            <When condition={inputs.decision}>
              <DecisionInput
                isFormFieldsLocked={isFormFieldsLocked}
                configurationId={selectedConfiguration?.id}
                decisionMakers={decisionMakers}
              />
            </When>
            <When condition={inputs.suspension}>
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
          isOkRequired={!lockDialogError}
          okButtonText="Yes"
          cancelButtonText={lockDialogError ? "Go Back" : "No"}
          onOk={() => handleSaveEvent(undefined, pushEvents, true)}
          onCancel={() => {
            setShowEventLockDialog(false);
            setLockDialogError("");
          }}
          isActionsRequired
        >
          {lockDialogError && (
            <Grid
              sx={{
                backgroundColor: Palette.error.bg.light,
                padding: "16px 24px 16px 24px",
                display: "flex",
                flexDirection: "column",
                color: Palette.error.dark,
                borderRadius: "4px",
                mt: 2,
                border: `1px solid ${Palette.error.dark}`,
              }}
              container
            >
              <Grid
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                }}
                item
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                ></Box>
                <Box sx={{ flex: "1 0 0" }}>
                  <ETHeading4
                    data-cy="error-box-title"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    {lockDialogError}
                  </ETHeading4>
                </Box>
              </Grid>
            </Grid>
          )}
        </TrackDialog>
      </FormProvider>
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
    </>
  );
};

export default EventForm;
