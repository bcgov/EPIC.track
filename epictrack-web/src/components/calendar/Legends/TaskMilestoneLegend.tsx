import { Box, ToggleButton } from "@mui/material";
import { LEGEND_COLOURS } from "../constants";
import { ETCaption1 } from "components/shared";
import CheckIcon from "@mui/icons-material/Check";
import { useEventCalendarContext } from "../EventCalendarContext";

const TaskMilestoneLegend = () => {
  const {
    milestoneSelected,
    setMilestoneSelected,
    taskSelected,
    setTaskSelected,
  } = useEventCalendarContext();

  return (
    <Box display="flex" alignItems="center" gap={2} m={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <ToggleButton
          value="milestone"
          selected={milestoneSelected}
          onChange={() => setMilestoneSelected((prev) => !prev)}
          sx={{
            bgcolor: LEGEND_COLOURS.backgroundColour.MILESTONE,
            borderColor: LEGEND_COLOURS.border.MILESTONE,
            borderRadius: "2px",
            border: "1px solid",
            minWidth: "1rem",
            minHeight: "1rem",
            padding: 0,
            "&:active, &:hover": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.MILESTONE,
            },
            "&.Mui-selected": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.MILESTONE,
            },
            "&.Mui-selected:hover": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.MILESTONE,
            },
          }}
        >
          <CheckIcon
            sx={{
              fontSize: "1rem",
              visibility: milestoneSelected ? "visible" : "hidden",
            }}
          />
        </ToggleButton>
        <ETCaption1 variant="body2">Milestones</ETCaption1>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <ToggleButton
          value="task"
          selected={taskSelected}
          onChange={() => setTaskSelected((prev) => !prev)}
          sx={{
            bgcolor: LEGEND_COLOURS.backgroundColour.TASK,
            borderColor: LEGEND_COLOURS.border.TASK,
            borderRadius: "2px",
            border: "1px solid",
            minWidth: "1rem",
            minHeight: "1rem",
            padding: 0,
            "&:active, &:hover": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.TASK,
            },
            "&.Mui-selected": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.TASK,
            },
            "&.Mui-selected:hover": {
              backgroundColor: LEGEND_COLOURS.backgroundColour.TASK,
            },
          }}
        >
          <CheckIcon
            sx={{
              fontSize: "1rem",
              visibility: taskSelected ? "visible" : "hidden",
            }}
          />
        </ToggleButton>
        <ETCaption1 variant="body2">Tasks</ETCaption1>
      </Box>
    </Box>
  );
};

export default TaskMilestoneLegend;
