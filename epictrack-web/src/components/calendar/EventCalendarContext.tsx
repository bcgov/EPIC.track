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

export interface CalendarSearchOptions {
  regions: string[];
  teams: string[];
  text: string;
  work_types: string[];
  project_types: string[];
  event_types: string[];
  work_ids: number[];
  staff_id: number | null;
  year: number;
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
  fetchMilestoneEvent: (id: number) => Promise<void>;
  fetchTaskEvent: (id: number) => Promise<void>;

  onSaveHandler: () => void;
  onCancelHandler: () => void;
  handleEventClick: (event: CalendarEvent) => Promise<void>;

  collapsedMonths: Record<string, boolean>;
  toggleMonth: (month: string) => void;
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
    teams: [],
    text: "",
    work_types: [],
    project_types: [],
    event_types: [],
    work_ids: [],
    staff_id: null,
    year: dayjs().year(),
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
      const [eventResult, taskResult] = await Promise.all([
        eventService.getCalendarEvents(searchOptions),
        taskEventService.getCalendarTasks(searchOptions),
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
        work_id: element.work_id,
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

      setEvents([...mappedEvents, ...mappedTasks]);
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [searchOptions]);

  const refetchEvents = getEvents;

  const fetchMilestoneEvent = useCallback(async (eventId: number) => {
    try {
      const result = await eventService.getById(eventId);
      if (result.status === 200) {
        setMilestoneEvent(result.data as MilestoneEvent);
      }
    } catch {
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    }
  }, []);

  const fetchTaskEvent = useCallback(async (eventId: number) => {
    try {
      const result = await taskEventService.getById(Number(eventId));
      if (result.status === 200) {
        const taskEvent = result.data as TaskEvent;
        taskEvent.assignee_ids = (result.data as any)["assignees"].map(
          (p: any) => p["assignee_id"]
        );
        taskEvent.responsibility_ids = (result.data as any)[
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
      setSelectedEvent(event);
      if (event.event.type === EVENT_TYPE.MILESTONE) {
        await fetchMilestoneEvent(event.event.id);
      } else if (event.event.type === EVENT_TYPE.TASK) {
        await fetchTaskEvent(event.event.id);
      }
    },
    [fetchMilestoneEvent, fetchTaskEvent]
  );

  useEffect(() => {
    setSearchOptions((prev) => ({ ...prev, year: selectedYear }));
  }, [selectedYear]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  useEffect(() => {
    if (selectedEvent?.event) {
      if (selectedEvent.event.type === EVENT_TYPE.MILESTONE) {
        fetchMilestoneEvent(selectedEvent.event.id);
      } else if (selectedEvent.event.type === EVENT_TYPE.TASK) {
        fetchTaskEvent(selectedEvent.event.id);
      }
    } else {
      setMilestoneEvent(undefined);
      setTaskEvent(undefined);
    }
  }, [selectedEvent, fetchMilestoneEvent, fetchTaskEvent]);

  const onSaveHandler = useCallback(() => {
    setSelectedEvent(null);
    refetchEvents();
  }, [refetchEvents]);

  const onCancelHandler = useCallback(() => {
    setSelectedEvent(null);
  }, []);

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
    fetchMilestoneEvent,
    fetchTaskEvent,
    onSaveHandler,
    onCancelHandler,
    handleEventClick,
    collapsedMonths,
    toggleMonth,
  };

  return (
    <EventCalendarContext.Provider value={value}>
      {children}
    </EventCalendarContext.Provider>
  );
};
