import React from 'react';
import { ListItemButton, List, ListItem, Box, Drawer, Toolbar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { Routes } from './SideNavElements';
import { Palette } from '../../../styles/theme';
import { SideNavProps } from './types';
import { When, Unless } from 'react-if';
import { EpicTrackH4 } from '../../common';

const DrawerBox = () => {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const location = useLocation();

    const getCurrentBaseRoute = () => {
        return Routes.map((route) => route.base)
            .filter((route) => location.pathname.includes(route))
            .reduce((prev, curr) => (prev.length > curr.length ? prev : curr));
    };
    const handleClick = (route: any) => {
        if (route.routes && route.routes.length > 0) {
            setOpen(!open);
        } else {
            navigate(route.path);
        }
    }

    const currentBaseRoute = getCurrentBaseRoute();

    return (
        <Box
            sx={{
                overflow: 'auto',
                height: '100%',
                background: Palette.primary.main
            }}
        >
            <List sx={{ paddingTop: '2.5em' }}>
                {Routes.map((route) => (
                    <>
                        <ListItem key={route.name}>
                            <ListItemButton
                                data-testid={`SideNav/${route.name}-button`}
                                onClick={() => handleClick(route)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: Palette.hover.light,
                                    },
                                }}
                            >
                                <When condition={currentBaseRoute === route.base}>
                                    <EpicTrackH4>{route.name}</EpicTrackH4>
                                </When>
                                <Unless condition={currentBaseRoute === route.base}>
                                    <EpicTrackH4 color={'white'}>{route.name}</EpicTrackH4>
                                </Unless>
                                <When condition={route.routes && route.routes?.length > 0} >
                                    {open ? <ExpandLess/> : <ExpandMore/>}
                                </When>
                            </ListItemButton>
                        </ListItem>
                        <When condition={route.routes && route.routes?.length > 0} >
                            <Collapse in={open} timeout="auto" unmountOnExit>
                                <List disablePadding>
                                    {route.routes?.map(subRoute => (
                                        <ListItem key={subRoute.name}>
                                            <ListItemButton onClick={() => handleClick(subRoute)}>
                                                <When condition={location.pathname === subRoute.base}>
                                                    <EpicTrackH4>{subRoute.name}</EpicTrackH4>
                                                </When>
                                                <Unless condition={location.pathname === subRoute.base}>
                                                    <EpicTrackH4 color={'white'}>{subRoute.name}</EpicTrackH4>
                                                </Unless>
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </When>
                    </>
                ))}
            </List>
        </Box>
    );
};

const SideNav = ({ open, setOpen, isMediumScreen, drawerWidth = 280 }: SideNavProps) => {
    return (
        <>
            {isMediumScreen ? (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: Palette.primary.main,
                        },
                    }}
                >
                    <Toolbar />
                    <DrawerBox />
                </Drawer>
            ) : (
                <Drawer
                    sx={{
                        width: '15%',
                        background: Palette.primary.main,
                    }}
                    onClose={() => setOpen(false)}
                    anchor={'left'}
                    open={open}
                    hideBackdrop={!open}
                >
                    <DrawerBox />
                </Drawer>
            )}
        </>
    );
};

export default SideNav;
