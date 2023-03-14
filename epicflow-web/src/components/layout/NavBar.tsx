import { AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, Menu, MenuItem, MenuList, Paper, Stack, Toolbar, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const toggleDrawer =
        (open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setOpen(open);
            };

    return (
        <Box sx={{ flexGrow: 1, margin: '15px 0 15px 0'}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => setOpen(!open)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        epicflow
                    </Typography>
                    {/* <Button color="inherit">Login</Button> */}
                </Toolbar>
            </AppBar>
            <Drawer
                anchor='left'
                open={open}
                onClose={toggleDrawer(!open)}
            >
                <List>
                    <ListItem>
                        <Link to="/staff-list" >Staff List</Link>
                    </ListItem>
                    <ListItem>
                        <Link to="/report-selector" >Report Selector</Link>
                    </ListItem>
                </List>
            </Drawer>
        </Box>
    )
}