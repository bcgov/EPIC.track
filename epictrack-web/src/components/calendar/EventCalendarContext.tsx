import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { CalendarEvent, MilestoneEvent } from "models/event";
import { eventService } from "services/eventService/eventService";
import { taskEventService } from "services/taskEventService/taskEventService";
import { EVENT_TYPE } from "../workPlan/phase/type";
import dateUtils from "utils/dateUtils";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { TaskEvent } from "models/taskEvent";
import { Work, WorkPhase } from "models/work";
import { workService } from "services/workService/workService";

export interface CalendarSearchOptions {
  event_types: string[];
  project_types: string[];
  regions: string[];
  staff_id: number | null;
  work_ids: number[];
  work_types: string[];
  year: number;
  teams: string[];
}

interface EventCalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  searchOptions: CalendarSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<CalendarSearchOptions>>;
  refetchEvents: () => void;

  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  modalOpen: boolean;

  milestoneEvent?: MilestoneEvent;
  taskEvent?: TaskEvent;
  loadEventDetails: (event: CalendarEvent) => Promise<void>;
  work?: Work;
  workPhase?: WorkPhase;

  onSaveHandler: () => void;
  onCancelHandler: () => void;
  handleEventClick: (event: CalendarEvent) => Promise<void>;

  collapsedMonths: Record<string, boolean>;
  toggleMonth: (month: string) => void;

  milestoneSelected: boolean;
  setMilestoneSelected: React.Dispatch<React.SetStateAction<boolean>>;
  taskSelected: boolean;
  setTaskSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventCalendarContext = createContext<
  EventCalendarContextType | undefined
>(undefined);

export const useEventCalendarContext = () => {
  const context = useContext(EventCalendarContext);
  if (!context) {
    throw new Error(
      "useEventCalendarContext must be used within a EventCalendarProvider"
    );
  }
  return context;
};

export const EventCalendarProvider = ({
  children,
  initialSearchOptions,
}: {
  children: React.ReactNode;
  initialSearchOptions?: CalendarSearchOptions;
}) => {
  const defaultSearchOptions: CalendarSearchOptions = {
    regions: [],
    work_types: [],
    project_types: [],
    event_types: [],
    work_ids: [],
    staff_id: null,
    year: dayjs().year(),
    teams: [],
    ...initialSearchOptions,
  };
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] =
    useState<CalendarSearchOptions>(defaultSearchOptions);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent>();
  const [taskEvent, setTaskEvent] = useState<TaskEvent>();
  const [work, setWork] = useState<Work>();
  const [workPhase, setWorkPhase] = useState<WorkPhase>();

  const [milestoneSelected, setMilestoneSelected] = useState(false);
  const [taskSelected, setTaskSelected] = useState(false);

  const [mappedEvents, setMappedEvents] = useState<CalendarEvent[]>([]);
  const [mappedTasks, setMappedTasks] = useState<CalendarEvent[]>([]);

  const modalOpen = selectedEvent !== null;

  const initialCollapsedMonths = useMemo(() => {
    const collapsed: Record<string, boolean> = {};
    const currentMonthLabel = dayjs().format("MMM 'YY");

    for (let i = 0; i < 12; i++) {
      const monthLabel = dayjs().year(selectedYear).month(i).format("MMM 'YY");
      collapsed[monthLabel] = monthLabel !== currentMonthLabel;
    }
    return collapsed;
  }, [selectedYear]);

  const [collapsedMonths, setCollapsedMonths] = useState<
    Record<string, boolean>
  >(initialCollapsedMonths);

  useEffect(() => {
    setCollapsedMonths(initialCollapsedMonths);
  }, [initialCollapsedMonths]);

  const toggleMonth = (month: string) =>
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }));

  const getEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventPromise = eventService.getCalendarEvents({
        ...searchOptions,
        event_types: searchOptions.event_types.filter(
          (t) => t !== "include_tasks:true"
        ),
      });

      let taskPromise: Promise<any> | null = null;

      if (searchOptions.event_types.includes("include_tasks:true")) {
        taskPromise = taskEventService.getCalendarTasks({
          ...searchOptions,
          event_types: [],
        });
      }

      const [eventResult, taskResult] = await Promise.all([
        eventPromise,
        taskPromise ?? Promise.resolve({ data: { items: [] } }),
      ]);

      const eventItems = (eventResult?.data?.items || []) as any[];
      const taskItems = (taskResult?.data?.items || []) as any[];

      const mappedEvents = eventItems.map((element) => ({
        event: {
          ...element.event,
          start_date:
            element.event.actual_date || element.event.anticipated_date,
          end_date: dateUtils
            .add(
              element.event.actual_date || element.event.anticipated_date,
              element.event.number_of_days,
              "days"
            )
            .toISOString(),
          type: EVENT_TYPE.MILESTONE,
        },
        phase_name: element.phase_name,
        phase_id: element.phase_id,
        work_name: element.work_name,
        work_id: element.event.work_id,
      }));
      const mappedTasks = taskItems.map((element) => ({
        event: {
          ...element.event,
          start_date: element.start_date,
          end_date: dateUtils
            .add(element.start_date, element.event.number_of_days - 1, "days")
            .toISOString(),
          type: EVENT_TYPE.TASK,
        },
        phase_name: element.phase_name,
        phase_id: element.phase_id,
        work_name: element.work_name,
        work_id: element.work_id,
      }));
      setMappedEvents(mappedEvents);
      setMappedTasks(mappedTasks);
      setEvents([...mappedEvents, ...mappedTasks]);
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [searchOptions]);

  useEffect(() => {
    // Handle filtering of milestones and tasks based on the toggle. Default behavior (none selected) shows both
    if (
      (milestoneSelected && taskSelected) ||
      (!milestoneSelected && !taskSelected)
    ) {
      setEvents([...mappedEvents, ...mappedTasks]);
    } else if (milestoneSelected) {
      setEvents([...mappedEvents]);
    } else if (taskSelected) {
      setEvents([...mappedTasks]);
    }
  }, [milestoneSelected, taskSelected]);

  const refetchEvents = getEvents;

  const loadEventDetails = useCallback(async (calendarEvent: CalendarEvent) => {
    try {
      setSelectedEvent(calendarEvent);

      const { work_id, phase_id, event } = calendarEvent;

      // always fetch work
      const workPromise = workService.getById(String(work_id));

      // conditionally fetch workPhase
      const phasePromise =
        event.type === EVENT_TYPE.MILESTONE
          ? workService.getWorkPhaseById(phase_id)
          : Promise.resolve(null);

      // fetch event details (milestone or task)
      const eventPromise =
        event.type === EVENT_TYPE.MILESTONE
          ? eventService.getById(event.id)
          : taskEventService.getById(event.id);

      const [workRes, phaseRes, eventRes] = await Promise.all([
        workPromise,
        phasePromise,
        eventPromise,
      ]);

      if (workRes.status === 200) setWork(workRes.data as Work);
      if (phaseRes) setWorkPhase(phaseRes as WorkPhase);

      if (event.type === EVENT_TYPE.MILESTONE && eventRes.status === 200) {
        setMilestoneEvent(eventRes.data as MilestoneEvent);
      } else if (event.type === EVENT_TYPE.TASK && eventRes.status === 200) {
        const taskEvent = eventRes.data as TaskEvent;
        taskEvent.assignee_ids = (eventRes.data as any)["assignees"].map(
          (p: any) => p["assignee_id"]
        );
        taskEvent.responsibility_ids = (eventRes.data as any)[
          "responsibilities"
        ].map((p: any) => p["responsibility_id"]);
        setTaskEvent(taskEvent);
      }
    } catch {
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    }
  }, []);

  const handleEventClick = useCallback(
    async (event: CalendarEvent) => {
      await loadEventDetails(event);
    },
    [loadEventDetails]
  );

  const resetEventDetails = useCallback(() => {
    setSelectedEvent(null);
    setMilestoneEvent(undefined);
    setTaskEvent(undefined);
    setWork(undefined);
    setWorkPhase(undefined);
  }, []);

  useEffect(() => {
    setSearchOptions((prev) => ({ ...prev, year: selectedYear }));
  }, [selectedYear]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  const onSaveHandler = useCallback(() => {
    resetEventDetails();
    refetchEvents();
  }, [refetchEvents, resetEventDetails]);

  const onCancelHandler = useCallback(() => {
    resetEventDetails();
  }, [resetEventDetails]);

  const value: EventCalendarContextType = {
    events,
    loading,
    selectedYear,
    setSelectedYear,
    searchOptions,
    setSearchOptions,
    refetchEvents: getEvents,
    selectedEvent,
    setSelectedEvent,
    modalOpen,
    milestoneEvent,
    taskEvent,
    loadEventDetails,
    onSaveHandler,
    onCancelHandler,
    handleEventClick,
    collapsedMonths,
    toggleMonth,
    work,
    workPhase,
    milestoneSelected,
    setMilestoneSelected,
    taskSelected,
    setTaskSelected,
  };

  return (
    <EventCalendarContext.Provider value={value}>
      {children}
    </EventCalendarContext.Provider>
  );
};
