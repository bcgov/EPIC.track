import { FC } from "react";
import { Box } from "@mui/material";
import { Palette } from "styles/theme";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { CalendarEvent } from "models/event";
import { resolveEventIconName, getLegendIconMap } from "./utils";

const legendIcons = getLegendIconMap();

export const getEventIcon = (event: CalendarEvent, showWorkLegend = true) => {
  if (!showWorkLegend) return null;

  const iconName = resolveEventIconName(event.event, legendIcons);
  const Icon: FC<IconProps> = Icons[iconName];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1rem",
        height: "1rem",
        flexShrink: 0,
      }}
    >
      <Icon
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        fill={Palette.primary.main}
      />
    </Box>
  );
};
