import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarEvent,
  CalendarSearchOptions,
  MilestoneEvent,
} from "models/event";
import { eventsApi } from "api/events";
import { tasksApi } from "api/tasks";
import { EVENT_TYPE } from "../workPlan/phase/type";
import dateUtils from "utils/dateUtils";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { TaskEvent } from "models/taskEvent";
import { Work, WorkPhase } from "models/work";
import { workPhasesApi } from "api/workPhases";
import { worksApi } from "api/works";

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
      "useEventCalendarContext must be used within a EventCalendarProvider",
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
    year: new Date().getFullYear(),
    teams: [],
    ...initialSearchOptions,
  };
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] =
    useState<CalendarSearchOptions>(defaultSearchOptions);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
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
    const currentMonthLabel = dateUtils.formatMonthLabel(
      new Date().getFullYear(),
      new Date().getMonth(),
    );

    for (let i = 0; i < 12; i++) {
      const monthLabel = dateUtils.formatMonthLabel(selectedYear, i);
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
      const eventPromise = eventsApi.listCalendar(searchOptions);

      const taskPromise = searchOptions.event_types.includes("task")
        ? tasksApi.listCalendar(searchOptions)
        : Promise.resolve([]);

      const [eventItems, taskItems] = await Promise.all([
        eventPromise,
        taskPromise,
      ]);

      const mappedEvents = eventItems.map((element) => ({
        event: {
          ...(element.event as any),
          start_date:
            element.event.actual_date || element.event.anticipated_date,
          end_date: dateUtils
            .add(
              element.event.actual_date || element.event.anticipated_date,
              element.event.number_of_days,
              "days",
            )
            .toISOString(),
          type: EVENT_TYPE.MILESTONE,
        },
        phase_name: element.phase_name,
        phase_id: element.phase_id,
        work_name: element.work_name,
        work_id: element.work_id,
      }));
      const mappedTasks = taskItems.map((element) => ({
        event: {
          ...(element.event as any),
          end_date: dateUtils
            .add(element.event.start_date, element.event.number_of_days, "days")
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
      showNotification("Failed to load My Calendar", {
        type: "error",
        duration: 3000,
      });
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
  }, [milestoneSelected, taskSelected, mappedEvents, mappedTasks]);

  const refetchEvents = getEvents;

  const loadEventDetails = useCallback(async (calendarEvent: CalendarEvent) => {
    try {
      setSelectedEvent(calendarEvent);

      const { work_id, phase_id, event } = calendarEvent;

      // always fetch work
      const workPromise = worksApi.get(work_id);

      // conditionally fetch workPhase; the drawer still opens without it
      const phasePromise =
        event.type === EVENT_TYPE.MILESTONE
          ? workPhasesApi.get(phase_id).catch((error) => {
              console.error(`Error fetching work phase ${phase_id}`, error);
              return null;
            })
          : Promise.resolve(null);

      // fetch event details (milestone or task)
      const milestonePromise =
        event.type === EVENT_TYPE.MILESTONE
          ? eventsApi.get(event.id)
          : Promise.resolve(null);
      const taskPromise =
        event.type === EVENT_TYPE.TASK
          ? tasksApi.get(event.id)
          : Promise.resolve(null);

      const [workRes, phaseRes, milestoneRes, taskRes] = await Promise.all([
        workPromise,
        phasePromise,
        milestonePromise,
        taskPromise,
      ]);

      setWork(workRes);
      if (phaseRes) setWorkPhase(phaseRes);

      if (milestoneRes) {
        setMilestoneEvent(milestoneRes);
      } else if (taskRes) {
        setTaskEvent(taskRes);
      }
    } catch {
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    }
  }, []);

  const handleEventClick = useCallback(
    async (event: CalendarEvent) => {
      await loadEventDetails(event);
    },
    [loadEventDetails],
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
