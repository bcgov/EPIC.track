import { Box } from "@mui/material";
import { Palette } from "styles/theme";
import { isWeekendByIndex } from "./utils";

type DaysHeaderProps = {
  cellSizePx: number;
  daysInRow: number;
  offset?: number;
};

const DaysHeader = ({ cellSizePx, daysInRow, offset }: DaysHeaderProps) => {
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const days = Array.from({ length: daysInRow }, (_, i) => dayNames[i % 7]);

  return (
    <Box
      display="grid"
      gridTemplateColumns={`${offset}px repeat(${daysInRow}, ${cellSizePx}px)`}
      gap={0.5}
    >
      <Box />
      {days.map((day, i) => (
        <Box
          key={i}
          fontSize={12}
          textAlign="center"
          alignContent={"center"}
          fontWeight={isWeekendByIndex(i) ? "normal" : "bold"}
          sx={{
            backgroundColor: isWeekendByIndex(i)
              ? "#F6F6F6"
              : Palette.neutral.bg.light,
            borderRadius: "2px",
            color: isWeekendByIndex(i) ? Palette.neutral.light : "inherit",
            height: cellSizePx,
          }}
        >
          {day}
        </Box>
      ))}
    </Box>
  );
};

export default DaysHeader;
