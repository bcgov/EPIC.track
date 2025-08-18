import { Grid, Stack } from "@mui/material";
import { useAppSelector } from "hooks";
import { ETPageContainer } from "components/shared";
import { getTotalHeaderHeight } from "components/layout/Header/constants";
import { EventCalendarProvider } from "components/calendar/EventCalendarContext";
import MyCalendarFilters from "./Filters";
import CalendarAssigneeToggle from "./Filters/CalendarAssigneeToggle";
import EventCalendarContainer from "components/calendar/EventCalendarContainer";
import { EVENT_TYPE_OPTIONS } from "./Filters/EventTypeFilter";

const MyCalendar = () => {
  const { showEnvBanner } = useAppSelector((state) => state.uiState);

  const user = useAppSelector((state) => state.user.userDetail);

  const defaultEventTypes = EVENT_TYPE_OPTIONS.map((option) => option.value);

  return (
    <EventCalendarProvider
      initialSearchOptions={{
        regions: [],
        work_types: [],
        project_types: [],
        event_types: defaultEventTypes,
        work_ids: [],
        staff_id: user?.staffId,
        year: new Date().getFullYear(),
      }}
    >
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
              <CalendarAssigneeToggle />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <MyCalendarFilters />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "2rem" }}>
            <EventCalendarContainer showFullLegend showWorkLegend />
          </Grid>
        </Grid>
      </ETPageContainer>
    </EventCalendarProvider>
  );
};

export default MyCalendar;
