import { Grid } from "@mui/material";
import { WorkTypeFilter } from "components/myWorkplans/Filters/WorkType";
import { EnvRegionFilter } from "components/myWorkplans/Filters/EnvRegionFilter";
import { ProjectTypeFilter } from "components/myWorkplans/Filters/ProjectTypeFilter";
import { useEventCalendarContext } from "components/calendar/EventCalendarContext";
import { EventTypeFilter } from "./EventTypeFilter";
import { WorkNameFilter } from "./WorkNameFilter";

export const MyCalendarFilters = () => {
  const { setSearchOptions, searchOptions } = useEventCalendarContext();

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      spacing={1}
      wrap="nowrap"
      sx={{
        maxHeight: "40px",
        paddingTop: "2rem",
      }}
    >
      <Grid item sx={{ flex: "0 0 33%" }}>
        <WorkNameFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <ProjectTypeFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <WorkTypeFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <EventTypeFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <EnvRegionFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
    </Grid>
  );
};

export default MyCalendarFilters;
