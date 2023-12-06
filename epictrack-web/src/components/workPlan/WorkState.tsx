import { Palette } from "../../styles/theme";
import { Box } from "@mui/system";
import { Case, Switch } from "react-if";
import { capitalizeFirstLetterOfWord } from "../../utils";

interface WorkStateProps {
  work_state?: string;
}

const WorkState = ({ work_state }: WorkStateProps) => {
  const formatWorkStateString = () => {
    if (!work_state) return;
    let workState = "";
    work_state.split("_").map((word: string) => {
      if (workState) {
        workState += " ";
      }
      workState += capitalizeFirstLetterOfWord(word);
    });

    return workState;
  };

  return (
    <Switch>
      <Case condition={work_state === "SUSPENDED"}>
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
      <Case condition={work_state === "IN_PROGRESS"}>
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
          work_state || ""
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
      <Case condition={work_state === "COMPLETED"}>
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
      <Case condition={work_state === "INACTIVE"}>
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
  );
};

export default WorkState;
