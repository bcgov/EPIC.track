import { Grid, Tooltip } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1 } from "../../shared";
import { StatusCardProps } from ".";
import StatusBadge from "./StatusBadge";

const StatusCardHeader = ({ status }: StatusCardProps) => {
  return (
    <Grid
      container
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `2px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "0.875rem",
        height: "88px",
        textTransform: "uppercase",
        fontSize: "13px",
      }}
      justifyContent="space-between"
      alignItems="start"
    >
      <Grid item xs={6}>
        <Tooltip title={status?.work_name ?? ""}>
          <span>
            <ETCaption1
              bold
              color={Palette.neutral.dark}
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                textOverflow: "ellipsis",
              }}
            >
              {status?.work_name}
            </ETCaption1>
          </span>
        </Tooltip>
      </Grid>
      <Grid
        item
        xs={6}
        container
        justifyContent={"flex-end"}
        spacing={2}
        sx={{
          padding: "0rem 0rem 0rem 0.875rem",
        }}
      >
        <Grid item xs={6}>
          <ETCaption1
            color={Palette.neutral.dark}
            sx={{ lineHeight: "1.2rem" }}
          >
            Project Status
          </ETCaption1>
          <ETCaption1 color={Palette.neutral.dark}>
            <StatusBadge is_active={status?.project_is_active} />
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1
            color={Palette.neutral.dark}
            sx={{ lineHeight: "1.2rem" }}
          >
            Work Status
          </ETCaption1>
          <ETCaption1 color={Palette.neutral.dark}>
            <StatusBadge is_active={status?.work_is_active} />
          </ETCaption1>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StatusCardHeader;
