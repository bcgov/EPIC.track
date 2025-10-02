import Staff from "./Staff";
import General from "./General";
import Partners from "./Partners";
import { Grid, Table } from "@mui/material";
import Trends from "./Trends";
import { TableFilterProvider } from "components/insights/TableFilterContext";

const WorkInsightsTabs = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableFilterProvider>
          <General />
        </TableFilterProvider>
      </Grid>
      <Grid item xs={12}>
        <TableFilterProvider>
          <Staff />
        </TableFilterProvider>
      </Grid>
      <Grid item xs={12}>
        <TableFilterProvider>
          <Partners />
        </TableFilterProvider>
      </Grid>
      <Grid item xs={12}>
        <TableFilterProvider>
          <Trends />
        </TableFilterProvider>
      </Grid>
    </Grid>
  );
};

export default WorkInsightsTabs;
