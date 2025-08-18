import { AssigneeToggle } from "components/myWorkplans/Filters/AssigneeToggle";
import { useEventCalendarContext } from "components/calendar/EventCalendarContext";

const CalendarAssigneeToggle = () => {
  const { searchOptions, setSearchOptions, loading } =
    useEventCalendarContext();

  return (
    <AssigneeToggle
      searchOptions={searchOptions}
      setSearchOptions={setSearchOptions}
      loading={loading}
      label="Calendar"
      total={1}
      disabled={true}
    />
  );
};

export default CalendarAssigneeToggle;
