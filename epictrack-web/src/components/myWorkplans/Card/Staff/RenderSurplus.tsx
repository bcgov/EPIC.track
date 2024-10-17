import { Avatar, Grid, Menu, MenuItem } from "@mui/material";
import React, { useEffect } from "react";
import { ETCaption2 } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import debounce from "lodash/debounce";

interface RenderSurplusProps {
  renderSurplus: number;
  staff: any[];
}

const RenderSurplus = ({ renderSurplus, staff }: RenderSurplusProps) => {
  const [inAvatar, setInAvatar] = React.useState<boolean>(false);
  const [inUserMenu, setInUserMenu] = React.useState<boolean>(false);
  const [userListAnchor, setUserListAnchor] =
    React.useState<null | HTMLElement>(null);

  const remainingStaff = staff.slice(renderSurplus - 1);

  const handleCloseUserMenu = () => {
    setUserListAnchor(null);
  };

  const debouncedSetInAvatar = debounce((_inAvatar: boolean) => {
    setInAvatar(_inAvatar);
  }, 100);

  useEffect(() => {
    if (!inAvatar && !inUserMenu) {
      setUserListAnchor(null);
    }
  }, [inAvatar, inUserMenu]);

  return (
    <>
      <Avatar
        onMouseEnter={(event) => {
          setUserListAnchor(event.currentTarget);
          setInAvatar(true);
        }}
        onMouseLeave={() => debouncedSetInAvatar(false)}
      >
        <MoreHorizIcon fontSize="small" />
      </Avatar>
      <Menu
        open={Boolean(userListAnchor)}
        onMouseEnter={() => setInUserMenu(true)}
        onMouseLeave={() => {
          setInUserMenu(false);
        }}
        anchorEl={userListAnchor}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={handleCloseUserMenu}
        sx={{
          pointerEvents: "none",
          mt: "2em",
        }}
        slotProps={{
          paper: {
            style: {
              pointerEvents: "none",
              width: 320,
              boxShadow: "0px 12px 24px 0px rgba(0, 0, 0, 0.10)",
            },
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
        {remainingStaff.map((staffObject: any, index) => {
          return (
            <MenuItem key={staffObject.id || index}>
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
