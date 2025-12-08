import { Grid } from "@mui/material";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import Staff from "./Staff";
import General from "./General";
import Partners from "./Partners";
import Trends from "./Trends";

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
