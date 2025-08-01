import { Grid } from "@mui/material";
import { NameFilter } from "../../../myWorkplans/Filters/NameFilter";
import { TeamFilter } from "../../../myWorkplans/Filters/TeamFilter";
import { WorkTypeFilter } from "../../../myWorkplans/Filters/WorkType";
import { EnvRegionFilter } from "../../../myWorkplans/Filters/EnvRegionFilter";
import { ProjectStatusFilter } from "./ProjectStatusFilter";
import { WorkStatusFilter } from "./WorkStatusFilter";
import { ApprovedFilter } from "../../Filters/ApprovedFilter";
import { StalenessFilter } from "../../Filters/StalenessFilter";
import { SortBy } from "../../Filters/SortBy";
import { MyStatusesContext } from "../MyStatusContext";
import { useContext } from "react";

export const Filters = () => {
  const { setSearchOptions, searchOptions, sortOrder, setSortOrder } =
    useContext(MyStatusesContext);

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
        <NameFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 10%" }}>
        <ProjectStatusFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 9%" }}>
        <WorkStatusFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 8%" }}>
        <ApprovedFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 9%" }}>
        <WorkTypeFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 6%" }}>
        <TeamFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 7%" }}>
        <EnvRegionFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 8%" }}>
        <StalenessFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 11%" }}>
        <SortBy
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          label="Date Posted"
        />
      </Grid>
    </Grid>
  );
};

export default Filters;
