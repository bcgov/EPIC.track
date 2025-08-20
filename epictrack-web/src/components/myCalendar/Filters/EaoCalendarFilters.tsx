import { Grid } from "@mui/material";
import { WorkTypeFilter } from "components/myWorkplans/Filters/WorkType";
import { EnvRegionFilter } from "components/myWorkplans/Filters/EnvRegionFilter";
import { ProjectTypeFilter } from "components/myWorkplans/Filters/ProjectTypeFilter";
import { useEventCalendarContext } from "components/calendar/EventCalendarContext";
import { WorkNameFilter } from "./WorkNameFilter";
import { EaoEventTypeFilter } from "./EaoEventTypeFilter";
import { TeamFilter } from "components/myWorkplans/Filters/TeamFilter";

export const EaoCalendarFilters = () => {
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
        <EaoEventTypeFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <EnvRegionFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 12%" }}>
        <TeamFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
    </Grid>
  );
};

export default EaoCalendarFilters;
