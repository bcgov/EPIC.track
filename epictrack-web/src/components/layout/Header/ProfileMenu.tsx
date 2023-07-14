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
  Typography,
  Button,
} from "@mui/material";
import UserIcon from "../../../assets/images/userIcon.svg";
import CopyOutlineIcon from "../../../assets/images/copyOutline.svg";
import CopyFilledIcon from "../../../assets/images/copyFilled.svg";

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
        marginRight: "40px",
        gap: "1rem",
      }}
      onMouseEnter={handleOpenProfileMenu}
      onMouseLeave={handleCloseProfileMenu}
    >
      <Box component="img" src={UserIcon} alt="User" />
      <Typography
        sx={{ fontSize: "18px", fontWeight: 700, lineHeight: "26px" }}
        component="span"
      >
        Hello, {user.firstName}
      </Typography>
      <Menu
        sx={{
          mt: "45px",
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
            bgcolor: "#F9F9FB",
            borderBlockColor: "#DBDCDC",
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
                width: 40,
                height: 40,
              }}
            >{`${user.firstName[0]}${user.lastName[0]}`}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={user.position}
            primaryTypographyProps={{
              variant: "subtitle2",
              sx: {
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "1rem",
              },
            }}
            secondaryTypographyProps={{
              variant: "inherit",
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
            primary="Contact"
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: "600",
              lineHeight: "20px",
            }}
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
          <Typography
            textAlign="center"
            sx={{
              flexGrow: 1,
              textAlign: "left",
            }}
          >
            {user.email}
          </Typography>
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
            <Typography
              textAlign="center"
              sx={{
                flexGrow: 1,
                textAlign: "left",
              }}
            >
              {user.phone}
            </Typography>
            <CopyButton copyText={user.phone} />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
