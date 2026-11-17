import { CalendarSearchOptions } from "models/event";
import { EventCalendarProvider } from "./EventCalendarContext";
import EventCalendarContainer from "./EventCalendarContainer";

interface CalendarProps {
  initialSearchOptions: CalendarSearchOptions;
}

const Calendar = ({ initialSearchOptions }: CalendarProps) => {
  return (
    <EventCalendarProvider initialSearchOptions={initialSearchOptions}>
      <EventCalendarContainer />
    </EventCalendarProvider>
  );
};

export default Calendar;
