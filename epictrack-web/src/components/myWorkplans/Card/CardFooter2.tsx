import { Button, Grid, Stack } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { CardProps } from "./type";
import { useNavigate } from "react-router-dom";
import React from "react";
import StaffDisplay from "./StaffDisplay";
import StaffGroup from "./Staff/StaffGroup";

const EyeIcon: React.FC<IconProps> = Icons["EyeIcon"];

const CardFooter2 = ({ workplan }: CardProps) => {
  const navigate = useNavigate();

  const team_lead = workplan.staff_info.find((staff: any) => {
    if (staff.role.name === "Team Lead") {
      return staff.staff.full_name;
    }
    return false;
  });

  return (
    <Grid
      item
      container
      sx={{
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 24px",
        height: "100px",
        overflowX: "scroll",
      }}
    >
      <Grid
        container
        direction="row"
        spacing={2}
        alignItems={"baseline"}
        justifyContent={"space-between"}
      >
        <Grid item>
          <Stack direction="column" spacing={2}>
            <ETCaption1 color={Palette.neutral.main}>TEAM</ETCaption1>
            <ETParagraph color={Palette.neutral.dark}>
              {workplan.eao_team.name}
            </ETParagraph>
          </Stack>
        </Grid>

        <Grid item>
          <Stack direction="column" spacing={2}>
            <ETCaption1 color={Palette.neutral.main}>Lead</ETCaption1>
            <ETParagraph
              color={Palette.neutral.dark}
              sx={{
                maxWidth: "75px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {team_lead?.staff.full_name}
            </ETParagraph>
          </Stack>
        </Grid>

        <Grid item>
          <Stack direction="column" spacing={2}>
            <ETCaption1 color={Palette.neutral.main}>STAFF</ETCaption1>
            <StaffGroup workplan={workplan} />
          </Stack>
        </Grid>

        <Grid item>
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
    </Grid>
  );
};

export default CardFooter2;
