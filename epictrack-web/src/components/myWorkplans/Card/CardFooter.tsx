import { Button, Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { CardProps } from "./type";
import { useNavigate } from "react-router-dom";
import React from "react";
import StaffGroup from "./Staff/StaffGroup";

const EyeIcon: React.FC<IconProps> = Icons["EyeIcon"];

const CardFooter = ({ workplan }: CardProps) => {
  const navigate = useNavigate();

  const team_lead = workplan.staff_info.find((staff: any) => {
    if (staff.role.name === "Team Lead") {
      return staff.staff.full_name;
    }
    return false;
  });

  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      sx={{
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 24px",
        alignItems: "center",
        height: "90px",
        overflow: "hidden",
      }}
    >
      <Grid item xs={9}>
        <Grid
          container
          spacing={3}
          direction={"row"}
          justifyContent={"space-between"}
        >
          <Grid item xs={4}>
            <Grid container direction="row" spacing={1}>
              <Grid item xs={12}>
                <ETCaption1 color={Palette.neutral.main}>TEAM</ETCaption1>
              </Grid>
              <Grid item xs={12}>
                <ETParagraph color={Palette.neutral.dark}>
                  {workplan.eao_team.name}
                </ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid
              container
              direction="row"
              spacing={1}
              alignItems={"flex-start"}
            >
              <Grid item xs={12}>
                <ETCaption1 color={Palette.neutral.main}>LEAD</ETCaption1>
              </Grid>
              <Grid item xs={12}>
                <ETParagraph
                  color={Palette.neutral.dark}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {team_lead?.staff.full_name}
                </ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="row" spacing={1}>
              <Grid item xs={12}>
                <ETCaption1 color={Palette.neutral.main}>STAFF</ETCaption1>
              </Grid>
              <Grid item xs={12}>
                <StaffGroup workplan={workplan} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="text"
          startIcon={<EyeIcon />}
          sx={{
            backgroundColor: "inherit",
            borderColor: "transparent",
          }}
          onClick={() => navigate(`/work-plan?work_id=${workplan.id}`)}
        >
          <ETCaption2 bold>View</ETCaption2>
        </Button>
      </Grid>
    </Grid>
  );
};

export default CardFooter;
