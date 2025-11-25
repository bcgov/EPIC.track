import { Box, Grid } from "@mui/material";
import { ETSubhead } from "components/shared";
import { titleStyle } from "components/workPlan/common/styles";
import { Palette } from "styles/theme";
import MonthWorkLegendItem from "./MonthWorkLegendItem";

export type CalendarWork = {
  id: number;
  title: string;
};

export interface WorksLegendProps {
  legendWorks: CalendarWork[];
}

const WorksLegend: React.FC<WorksLegendProps> = ({ legendWorks }) => {
  return (
    <Box
      sx={{
        padding: "0.5rem 1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <ETSubhead
          sx={{
            ...titleStyle,
            padding: "1rem 1rem",
          }}
          color={Palette.primary.main}
          bold
        >
          Work Legend
        </ETSubhead>
      </Box>
      {legendWorks.length > 0 && (
        <Box
          sx={{
            backgroundColor: Palette.neutral.bg.light,
            overflowY: "auto",
            flex: "0 1 auto",
            minHeight: 0,
            padding: "0.5rem",
          }}
        >
          <Grid container spacing={1}>
            {legendWorks.map((work) => (
              <Grid item xs={legendWorks.length === 1 ? 12 : 6} key={work.id}>
                <MonthWorkLegendItem name={work.title} work_id={work.id} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default WorksLegend;
