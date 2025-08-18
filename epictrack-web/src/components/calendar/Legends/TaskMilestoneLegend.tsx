import { Box } from "@mui/material";
import { LEGEND_COLOURS } from "../constants";
import { ETCaption1 } from "components/shared";

const TaskMilestoneLegend = () => {
  return (
    <Box display="flex" alignItems="center" gap={2} m={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          bgcolor={LEGEND_COLOURS.backgroundColour.MILESTONE}
          border={"1px solid"}
          borderColor={LEGEND_COLOURS.border.MILESTONE}
          borderRadius={"2px"}
          height={"1rem"}
          width={"1rem"}
        />
        <ETCaption1 variant="body2">Milestones</ETCaption1>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          bgcolor={LEGEND_COLOURS.backgroundColour.TASK}
          border={"1px solid"}
          borderColor={LEGEND_COLOURS.border.TASK}
          borderRadius={"2px"}
          height={"1rem"}
          width={"1rem"}
        />
        <ETCaption1 variant="body2">Tasks</ETCaption1>
      </Box>
    </Box>
  );
};

export default TaskMilestoneLegend;
