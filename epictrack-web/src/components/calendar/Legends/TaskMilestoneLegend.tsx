import { Box, ToggleButton } from "@mui/material";
import { LEGEND_COLOURS } from "../constants";
import { ETCaption1 } from "components/shared";
import { useEventCalendarContext } from "../EventCalendarContext";
import { Palette } from "../../../styles/theme";

const TaskMilestoneLegend = () => {
  const {
    milestoneSelected,
    setMilestoneSelected,
    taskSelected,
    setTaskSelected,
  } = useEventCalendarContext();

  return (
    <Box display="flex" alignItems="center" gap={2} m={2}>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          cursor: "pointer",
          p: 1,
          backgroundColor: milestoneSelected
            ? Palette.secondary.bg.light
            : "transparent", // highlight only when selected
          borderRadius: "3px",
        }}
        onClick={() => setMilestoneSelected((prev) => !prev)}
      >
        <ToggleButton
          value="milestone"
          selected={milestoneSelected}
          sx={{
            bgcolor: LEGEND_COLOURS.backgroundColour.MILESTONE + "!important",
            borderColor: LEGEND_COLOURS.border.MILESTONE,
            borderRadius: "2px",
            border: "1px solid",
            minWidth: "1rem",
            minHeight: "1rem",
            padding: 0,
            pointerEvents: "none",
          }}
        />
        <ETCaption1 variant="body2">Milestones</ETCaption1>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          cursor: "pointer",
          p: 1,
          backgroundColor: taskSelected
            ? Palette.secondary.bg.light
            : "transparent",
          borderRadius: "3px",
        }}
        onClick={() => setTaskSelected((prev) => !prev)}
      >
        <ToggleButton
          value="task"
          selected={taskSelected}
          sx={{
            bgcolor: LEGEND_COLOURS.backgroundColour.TASK + "!important",
            borderColor: LEGEND_COLOURS.border.TASK,
            borderRadius: "2px",
            border: "1px solid",
            minWidth: "1rem",
            minHeight: "1rem",
            padding: 0,
            pointerEvents: "none",
          }}
        />
        <ETCaption1 variant="body2">Tasks</ETCaption1>
      </Box>
    </Box>
  );
};

export default TaskMilestoneLegend;
