import { Grid } from "@mui/material";
import General from "./General";
import Trends from "./Trends";
import { TableFilterProvider } from "components/insights/TableFilterContext";

const PhaseInsightsTabs = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableFilterProvider>
          <General />
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

export default PhaseInsightsTabs;
