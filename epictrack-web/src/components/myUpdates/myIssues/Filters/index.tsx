import { useContext } from "react";
import { Grid } from "@mui/material";
import { EnvRegionFilter } from "components/myWorkplans/Filters/EnvRegionFilter";
import { NameFilter } from "components/myWorkplans/Filters/NameFilter";
import { TeamFilter } from "components/myWorkplans/Filters/TeamFilter";
import { WorkTypeFilter } from "components/myWorkplans/Filters/WorkType";
import { ApprovedFilter } from "../../Filters/ApprovedFilter";
import { StalenessFilter } from "../../Filters/StalenessFilter";
import { SortBy } from "../../Filters/SortBy";
import { MyIssuesContext } from "../MyIssuesContext";
import { IssueStateFilter } from "./IssuesStateFilter";

export const Filters = () => {
  const { setSearchOptions, searchOptions, sortOrder, setSortOrder } =
    useContext(MyIssuesContext);

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
        <IssueStateFilter />
      </Grid>
      <Grid item sx={{ flex: "0 0 10%" }}>
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
      <Grid item sx={{ flex: "0 0 9%" }}>
        <TeamFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 9%" }}>
        <EnvRegionFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 10%" }}>
        <StalenessFilter
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </Grid>
      <Grid item sx={{ flex: "0 0 11%" }}>
        <SortBy
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          label="Date Updated"
        />
      </Grid>
    </Grid>
  );
};

export default Filters;
