import { Grid } from "@mui/material";
import { ETSubhead } from "components/shared";
import { titleStyle } from "components/workPlan/common/styles";
import { Palette } from "styles/theme";
import LegendItem from "./LegendItem";
import { LEGEND_ITEMS } from "../constants";

export interface CalendarType {
  calendar: "my-calendar" | "eao-calendar";
}

const FullCalendarLegend: React.FC<CalendarType> = ({ calendar }) => {
  const filteredItems = LEGEND_ITEMS.filter((item) =>
    item.calendars.includes(calendar),
  );

  return (
    <Grid container sx={{ padding: "0.5rem 1rem" }}>
      <Grid item xs={12}>
        <ETSubhead
          sx={{
            ...titleStyle,
            padding: "1rem 1rem",
          }}
          color={Palette.primary.main}
          bold
        >
          Icon Legend
        </ETSubhead>
      </Grid>
      <Grid item xs={12}>
        {filteredItems.map((item) => (
          <LegendItem key={item.text} icon={item.icon} text={item.text} />
        ))}
      </Grid>
    </Grid>
  );
};

export default FullCalendarLegend;
