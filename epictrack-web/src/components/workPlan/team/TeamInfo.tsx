import React from "react";
import { WorkplanContext } from "../WorkPlanContext";
import { Box, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETSubhead } from "../../shared";
import Icons from "../../icons/index";
import { IconProps } from "../../icons/type";

const EditIcon: React.FC<IconProps> = Icons["EditIcon"];

const useStyle = makeStyles({
  infoBox: {
    backgroundColor: Palette.neutral.bg.light,
    padding: "1rem 1rem 1rem 1.5rem",
  },
  title: {
    textTransform: "uppercase",
    lineHeight: "1rem",
    color: Palette.neutral.main,
  },
  value: {
    lineHeight: "1.5rem",
    color: Palette.neutral.dark,
  },
  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    cursor: "pointer",
  },
  icon: {
    fill: Palette.primary.accent.main,
  },
  iconText: {
    color: Palette.primary.accent.main,
  },
});

export interface TeamInfoBoxProps {
  title: string;
  value: string | undefined;
  onEdit?: () => void;
}
const TeamInfoBox = (props: TeamInfoBoxProps) => {
  const classes = useStyle();
  return (
    <Grid container sx={{ marginBottom: "1rem" }}>
      <Grid item xs={12} className={classes.infoBox}>
        <Grid container rowSpacing={1}>
          <Grid item xs={12}>
            <ETCaption1 bold className={classes.title}>
              {props.title}
            </ETCaption1>
          </Grid>
          <Grid item xs={10}>
            <ETSubhead className={classes.value}>{props.value}</ETSubhead>
          </Grid>
          <Grid item xs={2} className={classes.iconBox}>
            <EditIcon className={classes.icon} />
            <ETCaption2 bold className={classes.iconText}>
              Edit
            </ETCaption2>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const TeamInfo = () => {
  const ctx = React.useContext(WorkplanContext);
  return (
    <>
      {ctx.work?.eao_team && (
        <TeamInfoBox title="Name" value={ctx.work?.eao_team.name} />
      )}
      {ctx.work?.work_lead && (
        <TeamInfoBox title="Lead" value={ctx.work?.work_lead.full_name} />
      )}
      {ctx.work?.responsible_epd && (
        <TeamInfoBox title="EPD" value={ctx.work?.responsible_epd.full_name} />
      )}
    </>
  );
};

export default TeamInfo;
