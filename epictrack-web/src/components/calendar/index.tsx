import { EventCalendarProvider } from "./EventCalendarContext";
import EventCalendarContainer from "./EventCalendarContainer";

const Calendar = ({ workId }: { workId?: number }) => {
  return (
    <EventCalendarProvider
      initialSearchOptions={{
        regions: [],
        teams: [],
        text: "",
        work_types: [],
        project_types: [],
        event_types: [],
        work_ids: workId ? [workId] : [],
        staff_id: null,
        year: new Date().getFullYear(),
      }}
    >
      <EventCalendarContainer />
    </EventCalendarProvider>
  );
};

export default Calendar;
