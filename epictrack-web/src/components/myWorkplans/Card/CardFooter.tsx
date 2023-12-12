import { Avatar, AvatarGroup, Box, Button, Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { CardProps } from "./type";
import { useNavigate } from "react-router-dom";
import React from "react";
import UserMenu from "../../shared/userMenu/UserMenu";
import RenderSurplus from "./RenderSurplus";

const EyeIcon: React.FC<IconProps> = Icons["EyeIcon"];

const CardFooter = ({ workplan }: CardProps) => {
  const navigate = useNavigate();
  const [staffHover, setStaffHover] = React.useState<any>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const team_lead = workplan.staff_info.find((staff: any) => {
    if (staff.role.name === "Team Lead") {
      return staff.staff.full_name;
    }
    return false;
  });

  const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(null);
    setStaffHover(null);
  };

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    staff: any
  ) => {
    setStaffHover(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      sx={{
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 32px",
        alignItems: "center",
        // height: "80px",
      }}
    >
      <Grid item>
        <Grid container spacing={2}>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>TEAM</ETCaption1>
              </Grid>
              <Grid item>
                <ETParagraph color={Palette.neutral.dark}>
                  {workplan.eao_team.name}
                </ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>LEAD</ETCaption1>
              </Grid>
              <Grid item>
                <ETParagraph color={Palette.neutral.dark}>
                  {team_lead?.staff.full_name}
                </ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="column"
              spacing={0.6}
              alignItems="center"
              justifyContent="flex-start"
            >
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>STAFF</ETCaption1>
              </Grid>
              <Grid item>
                <AvatarGroup
                  spacing={2}
                  max={4}
                  renderSurplus={(surplus: number) => (
                    <RenderSurplus renderSurplus={surplus} />
                  )}
                >
                  {workplan.staff_info.map((staff: any) => {
                    return (
                      <Avatar
                        key={staff.staff.id}
                        sx={{
                          bgcolor: Palette.neutral.bg.main,
                          color: Palette.neutral.dark,
                          lineHeight: "12px",
                          width: "24px",
                          height: "24px",
                        }}
                        onMouseEnter={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          handleOpenUserMenu(event, staff.staff);
                        }}
                        onMouseLeave={handleCloseUserMenu}
                      >
                        <ETCaption2
                          bold
                        >{`${staff.staff.first_name[0]}${staff.staff.last_name[0]}`}</ETCaption2>
                        <UserMenu
                          anchorEl={userMenuAnchorEl}
                          email={staffHover?.email || ""}
                          phone={staffHover?.phone || ""}
                          position={staffHover?.position?.name || ""}
                          firstName={staffHover?.first_name || ""}
                          lastName={staffHover?.last_name || ""}
                          onClose={handleCloseUserMenu}
                          origin={{ vertical: "top", horizontal: "left" }}
                          sx={{
                            pointerEvents: "none",
                          }}
                          id={staff.staff.id}
                        />
                      </Avatar>
                    );
                  })}
                </AvatarGroup>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
  );
};

export default CardFooter;
