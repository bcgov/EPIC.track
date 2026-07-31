import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1 } from "../../shared";
import { CardProps } from "./type";

export const CARD_HEADER_HEIGHT = "48px";

const CardHeader = ({ workplan }: CardProps) => {
  return (
    <Grid
      container
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `2px solid ${Palette.neutral.bg.dark}`,
        padding: "12px 24px",
        alignItems: "center",
        height: CARD_HEADER_HEIGHT,
      }}
      justifyContent="space-between"
      alignContent={"center"}
    >
      <Grid
        item
        xs={10}
        container
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <ETCaption1
          bold
          color={Palette.neutral.dark}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {workplan?.project?.name}
        </ETCaption1>
      </Grid>
    </Grid>
  );
};

export default CardHeader;
