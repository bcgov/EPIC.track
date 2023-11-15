import { useContext } from "react";
import { ETCaption3 } from "../shared";
import { Palette } from "../../styles/theme";
import { Box } from "@mui/system";
import { WorkplanContext } from "./WorkPlanContext";
import { Case, Switch } from "react-if";

const WorkState = () => {
  const { work } = useContext(WorkplanContext);

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const formatWorkStateString = () => {
    let workState = "";
    work?.work_state.split("_").map((word: string) => {
      if (workState) {
        workState += " ";
      }
      workState += capitalizeFirstLetter(word);
    });

    return workState;
  };

  return (
    <ETCaption3 bold>
      <Switch>
        <Case condition={work?.work_state === "SUSPENDED"}>
          <Box
            sx={{
              borderRadius: "4px",
              padding: "4px 8px",
              backgroundColor: Palette.secondary.bg.light,
              color: Palette.secondary.dark,
            }}
          >
            {formatWorkStateString()}
          </Box>
        </Case>
        <Case condition={work?.work_state === "IN_PROGRESS"}>
          <Box
            sx={{
              borderRadius: "4px",
              padding: "4px 8px",
              backgroundColor: Palette.success.bg.light,
              color: Palette.success.dark,
            }}
          >
            {formatWorkStateString()}
          </Box>
        </Case>
        <Case
          condition={["WITHDRAWN", "CLOSED", "TERMINATED"].includes(
            work?.work_state || ""
          )}
        >
          <Box
            sx={{
              borderRadius: "4px",
              padding: "4px 8px",
              backgroundColor: Palette.error.bg.light,
              color: Palette.error.dark,
            }}
          >
            {formatWorkStateString()}
          </Box>
        </Case>
        <Case condition={work?.work_state === "COMPLETED"}>
          <Box
            sx={{
              borderRadius: "4px",
              padding: "4px 8px",
              backgroundColor: Palette.primary.bg.main,
              color: Palette.primary.main,
            }}
          >
            {formatWorkStateString()}
          </Box>
        </Case>
        <Case condition={work?.work_state === "INACTIVE"}>
          <Box
            sx={{
              borderRadius: "4px",
              padding: "4px 8px",
              backgroundColor: Palette.neutral.bg.main,
              color: Palette.neutral.main,
            }}
          >
            {formatWorkStateString()}
          </Box>
        </Case>
      </Switch>
    </ETCaption3>
  );
};

export default WorkState;
