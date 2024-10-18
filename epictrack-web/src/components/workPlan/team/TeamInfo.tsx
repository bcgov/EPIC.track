import React from "react";
import { WorkplanContext } from "../WorkPlanContext";
import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETSubhead } from "../../shared";
import Icons from "../../icons/index";
import { IconProps } from "../../icons/type";

const EditIcon: React.FC<IconProps> = Icons["EditIcon"];

export interface TeamInfoBoxProps {
  title: string;
  value: string | undefined;
  onEdit?: () => void;
}
const TeamInfoBox = (props: TeamInfoBoxProps) => {
  return (
    <Grid container sx={{ marginBottom: "1rem" }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: Palette.neutral.bg.light,
          padding: "1rem 1rem 1rem 1.5rem",
        }}
      >
        <Grid container rowSpacing={1}>
          <Grid item xs={12}>
            <ETCaption1
              bold
              sx={{
                textTransform: "uppercase",
                lineHeight: "1rem",
                color: Palette.neutral.main,
              }}
            >
              {props.title}
            </ETCaption1>
          </Grid>
          <Grid item xs={10}>
            <ETSubhead
              sx={{
                lineHeight: "1.5rem",
                color: Palette.neutral.dark,
              }}
            >
              {props.value}
            </ETSubhead>
          </Grid>
          {/* <Grid
            item
            xs={2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              cursor: "pointer",
            }}
          > */}
          {/* Commenting this out as this has to bring back when we finalize what to do with this feature */}
          {/* <EditIcon fill={Palette.primary.accent.main} /> */}
          {/* <ETCaption2
              bold
              sx={{
                color: Palette.primary.accent.main,
              }}
            >
              Edit
            </ETCaption2> */}
          {/* </Grid> */}
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
