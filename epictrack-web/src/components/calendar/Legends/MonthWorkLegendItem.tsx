import { Box, Tooltip } from "@mui/material";
import { ETCaption1 } from "components/shared";
import { WORKPLAN_TAB } from "components/workPlan/constants";
import { useNavigate } from "react-router-dom";
import { darkenHex, getWorkColour } from "./utils";
import { Palette } from "styles/theme";

export interface MonthWorkLegendItemProps {
  name: string;
  work_id: number;
}

const MonthWorkLegendItem = (item: MonthWorkLegendItemProps) => {
  const navigate = useNavigate();

  const handleWorkClick = () => {
    navigate(`/work-plan?work_id=${item.work_id}`, {
      state: { tabIndex: WORKPLAN_TAB.CALENDAR.index },
    });
  };

  const colour = getWorkColour(item.name);

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      gap={1}
      onClick={() => {
        handleWorkClick();
      }}
      sx={{
        cursor: "pointer",
        width: "100%",
        padding: "0.275rem 0.275rem",
        color: Palette.primary.accent.main,
        "&:hover": {
          color: Palette.primary.accent.light,
        },
      }}
    >
      <Box
        bgcolor={colour}
        border={"1px solid"}
        borderColor={darkenHex(colour, 0.3)}
        borderRadius={"2px"}
        height={"1rem"}
        width={"1rem"}
        marginTop={"0.275rem"}
        lineHeight={"1rem"}
      />
      <Tooltip title={item.name} sx={{ width: "100%" }}>
        <Box sx={{ width: "100%", overflow: "hidden" }}>
          <ETCaption1
            variant="body2"
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontSize: "0.8125rem",
            }}
          >
            {item.name}
          </ETCaption1>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default MonthWorkLegendItem;
