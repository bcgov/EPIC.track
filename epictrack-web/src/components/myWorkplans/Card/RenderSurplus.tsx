import {
  Avatar,
  Grid,
  Menu,
  MenuItem,
  PopoverOrigin,
  Typography,
} from "@mui/material";
import { Staff } from "../../../models/staff";
import React from "react";
import { ETCaption2 } from "../../shared";
import { Palette } from "../../../styles/theme";

interface RenderSurplusProps {
  renderSurplus: number;
  staff: any[];
}

const RenderSurplus = ({ renderSurplus, staff }: RenderSurplusProps) => {
  const [userListAnchor, setUserListAnchor] =
    React.useState<null | HTMLElement>(null);

  const remainingStaff = staff.slice(renderSurplus - 1);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserListAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserListAnchor(null);
  };

  return (
    <>
      <Avatar
        onMouseEnter={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleOpenUserMenu(event);
        }}
      >
        <Typography sx={{ textAlign: "center" }}>...</Typography>
      </Avatar>
      <Menu
        open={Boolean(userListAnchor)}
        onMouseLeave={handleCloseUserMenu}
        anchorEl={userListAnchor}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={handleCloseUserMenu}
        sx={{
          mt: "2.5rem",
        }}
        PaperProps={{
          style: {
            pointerEvents: "none",
            width: 320,
            boxShadow: "0px 12px 24px 0px rgba(0, 0, 0, 0.10)",
          },
        }}
        MenuListProps={{
          style: {
            paddingTop: 0,
            paddingBottom: 0,
            pointerEvents: "auto",
          },
        }}
      >
        {remainingStaff.map((staffObject: any) => {
          return (
            <MenuItem>
              <Avatar
                key={staffObject?.staff?.id}
                sx={{
                  bgcolor: Palette.neutral.bg.main,
                  color: Palette.neutral.dark,
                  width: "32px",
                  height: "32px",
                  padding: "4px 8px",
                  marginRight: "8px",
                }}
              >
                <ETCaption2>{`${staffObject?.staff?.first_name[0]}${staffObject?.staff?.last_name[0]}`}</ETCaption2>
              </Avatar>
              <Grid container direction={"column"}>
                <Grid item>
                  <ETCaption2 bold>{staffObject?.staff?.full_name}</ETCaption2>
                </Grid>
                <Grid item>
                  <ETCaption2>{staffObject?.staff?.position?.name}</ETCaption2>
                </Grid>
              </Grid>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default RenderSurplus;
