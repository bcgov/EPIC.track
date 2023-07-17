import React from "react";
import Box from "@mui/material/Box";
import { Palette } from "../../../styles/theme";
import { useAppSelector } from "../../../hooks";
import {
  Menu,
  MenuItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Tooltip,
} from "@mui/material";
import CopyOutlineIcon from "../../../assets/images/copyOutline.svg";
import CopyFilledIcon from "../../../assets/images/copyFilled.svg";
import { ETCaption1, ETSubhead } from "../../shared";

const CopyButton = ({ ...props }) => {
  const copyHandler = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  // TODO: Switch to using fill color from state instead of changing src
  const [fillColor, setFillColor] = React.useState<string>("#FFFFFF");
  return (
    <Button
      onClick={() => copyHandler(props.copyText)}
      size="small"
      sx={{ width: 32 }}
    >
      <Box
        component="img"
        src={CopyOutlineIcon}
        alt="Copy"
        sx={{ fill: fillColor }}
        onMouseEnter={(e) => (e.currentTarget.src = CopyFilledIcon)}
        onMouseLeave={(e) => (e.currentTarget.src = CopyOutlineIcon)}
      />
    </Button>
  );
};
const ProfileMenu = () => {
  const user = useAppSelector((state) => state.user.userDetail);

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(null);
  };

  return (
    <Box
      sx={{
        flexGrow: 0,
        display: "flex",
        alignItems: "baseline",
        marginRight: "40px",
        gap: "1rem",
      }}
      onMouseEnter={handleOpenProfileMenu}
      onMouseLeave={handleCloseProfileMenu}
    >
      <ETSubhead>Hello, {user.firstName}</ETSubhead>
      <Avatar
        sx={{
          bgcolor: Palette.white,
          color: Palette.primary.main,
          fontSize: "1rem",
          lineHeight: "1.3rem",
          fontWeight: 700,
          width: "2rem",
          height: "2rem",
        }}
      >
        {`${user.firstName[0]}${user.lastName[0]}`}
      </Avatar>
      <Menu
        sx={{
          mt: "2.5rem",
        }}
        id="menu-appbar"
        anchorEl={profileMenuAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(profileMenuAnchorEl)}
        onClose={handleCloseProfileMenu}
        style={{ pointerEvents: "none" }}
        PaperProps={{
          style: { pointerEvents: "auto", width: 320 },
        }}
      >
        <MenuItem
          key="userDetail"
          sx={{
            bgcolor: Palette.nuetral.bg.light,
            borderBlockColor: "#DBDCDC",
            gap: "8px",
            "&:hover": {
              bgcolor: "#F9F9FB",
            },
          }}
          divider
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: Palette.primary.main,
                width: "2rem",
                height: "2rem",
                minWidth: "0",
                fontSize: "1rem",
                lineHeight: "1.3rem",
                fontWeight: 700,
              }}
            >
              {`${user.firstName[0]}${user.lastName[0]}`}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <ETCaption1 bold>
                {`${user.firstName} ${user.lastName}`}
              </ETCaption1>
            }
            secondary={<ETCaption1>{user.position}</ETCaption1>}
            primaryTypographyProps={{
              noWrap: true,
            }}
            secondaryTypographyProps={{
              noWrap: true,
            }}
          />
        </MenuItem>
        <MenuItem
          sx={{
            "&:hover": {
              bgcolor: "transparent",
            },
          }}
          key="contact"
        >
          <ListItemText
            primary={<ETCaption1 bold>Contact</ETCaption1>}
          ></ListItemText>
        </MenuItem>
        <MenuItem
          key="email"
          sx={{
            "&:hover": {
              bgcolor: "transparent",
            },
          }}
        >
          <ListItemText
            primary={
              <Tooltip title={user.email} arrow>
                <ETCaption1 color={Palette.primary.accent.main}>
                  {user.email}
                </ETCaption1>
              </Tooltip>
            }
            primaryTypographyProps={{
              noWrap: true,
            }}
          ></ListItemText>
          <CopyButton copyText={user.email} />
        </MenuItem>
        {user.phone && (
          <MenuItem
            key="phone"
            sx={{
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <ListItemText
              primary={
                <Tooltip title={user.phone}>
                  <ETCaption1 color={Palette.primary.accent.main}>
                    {user.phone}
                  </ETCaption1>
                </Tooltip>
              }
              primaryTypographyProps={{
                noWrap: true,
              }}
            ></ListItemText>
            <CopyButton copyText={user.phone} />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
