import { Grid, Stack } from "@mui/material";
import { useAppSelector } from "hooks";
import { ETPageContainer } from "components/shared";
import { getTotalHeaderHeight } from "components/layout/Header/constants";
import { EventCalendarProvider } from "components/calendar/EventCalendarContext";
import MyCalendarFilters from "./Filters";
import CalendarAssigneeToggle from "./Filters/CalendarAssigneeToggle";
import EventCalendarContainer from "components/calendar/EventCalendarContainer";
import { EVENT_TYPE_OPTIONS } from "./Filters/EventTypeFilter";
import EaoCalendarFilters from "./Filters/EaoCalendarFilters";
import { useMemo, useState } from "react";
import { EAO_EVENT_TYPE_OPTIONS } from "./Filters/EaoEventTypeFilter";

const MyCalendar = () => {
  const { showEnvBanner } = useAppSelector((state) => state.uiState);
  const user = useAppSelector((state) => state.user.userDetail);

  const [isMyCalendar, setIsMyCalendar] = useState(true);

  const defaultEventTypes = EVENT_TYPE_OPTIONS.map((option) => option.value);
  const defaultEaoEventTypes = EAO_EVENT_TYPE_OPTIONS.map(
    (option) => option.value,
  );

  const initialSearchOptions = useMemo(() => {
    if (isMyCalendar) {
      return {
        regions: [],
        work_types: [],
        project_types: [],
        event_types: defaultEventTypes,
        work_ids: [],
        staff_id: user?.staffId,
        teams: [],
        year: new Date().getFullYear(),
      };
    }
    return {
      regions: [],
      work_types: [],
      project_types: [],
      event_types: defaultEaoEventTypes,
      work_ids: [],
      staff_id: null,
      teams: [],
      year: new Date().getFullYear(),
    };
  }, [isMyCalendar, user?.staffId, defaultEventTypes, defaultEaoEventTypes]);

  return (
    <ETPageContainer container spacing={2}>
      <Grid
        item
        xs={12}
        container
        spacing={2}
        sx={{
          position: "sticky",
          top: getTotalHeaderHeight(showEnvBanner),
          backgroundColor: "white",
          paddingBottom: "1em",
        }}
      >
        <Grid item xs={12} container justifyContent="flex-end">
          <Stack direction="row" spacing={1}>
            <CalendarAssigneeToggle
              handleToggle={setIsMyCalendar}
              isUsersItems={isMyCalendar}
              label={"Calendar"}
            />
          </Stack>
        </Grid>
        <EventCalendarProvider
          key={isMyCalendar ? "my-calendar" : "eao-calendar"}
          initialSearchOptions={initialSearchOptions}
        >
          <Grid item xs={12}>
            {isMyCalendar ? <MyCalendarFilters /> : <EaoCalendarFilters />}
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "2rem" }}>
            <EventCalendarContainer
              showFullLegend
              showWorkLegend
              calendarType={isMyCalendar ? "my-calendar" : "eao-calendar"}
            />
          </Grid>
        </EventCalendarProvider>
      </Grid>
    </ETPageContainer>
  );
};

export default MyCalendar;
