import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { useMediaQuery, Theme, IconButton } from '@mui/material';
import { When } from 'react-if';
import MenuIcon from '@mui/icons-material/Menu';
import CssBaseline from '@mui/material/CssBaseline';
import { Palette } from '../../../styles/theme'
import EnvironmentBanner from './EnvironmentBanner';
import SideNav from '../SideNav/SideNav';
import {ReactComponent as BCLogo} from '../../../assets/images/bcgovlogo.svg'
import { EpicTrackH1 } from '../../common';

const Header = ({ drawerWidth = 280 }) => {
    const [open, setOpen] = React.useState(false);
    const isMediumScreen: boolean = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme: Theme) => (isMediumScreen ? theme.zIndex.drawer + 1 : theme.zIndex.drawer),
                    color: Palette.text.primary,
                    bgcolor: Palette.primary.main
                }}
                data-testid="appbar-header"
            >
                <CssBaseline />
                <Toolbar>
                <When condition={!isMediumScreen}>
                    <IconButton
                        component={MenuIcon}
                        color="info"
                        sx={{
                            height: '2em',
                            width: '2em',
                            marginRight: { xs: '1em' },
                        }}
                        onClick={() => setOpen(!open)}
                    />
                </When>
                <Box
                        component={BCLogo}
                        sx={{
                            height: '5em',
                            width: { xs: '7em', md: '15em' },
                            marginRight: { xs: '1em', md: '3em' },
                        }}
                        alt="British Columbia Logo"
                    />
                    {isMediumScreen ? (
                        <EpicTrackH1 sx={{ flexGrow: 1 }}>EPIC Track</EpicTrackH1>
                    ) : (
                        <EpicTrackH1 sx={{ flexGrow: 1 }}>EPIC Track</EpicTrackH1>
                    )}
                </Toolbar>
                <EnvironmentBanner />
            </AppBar>
            <SideNav
                setOpen={setOpen}
                data-testid="sidenav-header"
                isMediumScreen={isMediumScreen}
                open={open}
                drawerWidth={drawerWidth}
            />
        </>
    );
};

export default Header;
