import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Grid, TextField, Button } from '@mui/material';
import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import StaffService from '../../../services/staffService';
import DeleteIcon from '@mui/icons-material/Delete'

export default function StaffList() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [staffs, setStaffs] = useState([]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getStaff = async () => {
        const staffResult = await StaffService.getStaffs();
        if (staffResult.status === 200) {
            setStaffs((staffResult.data as never)['staffs']);
        }

    }
    useEffect(() => {
        setTimeout(()=>getStaff(),10);
    });
    return (
        <Container maxWidth="xl">
            <Grid container spacing={0.5}  justifyContent='space-between'>
                <Grid item>
                    <TextField placeholder='Search' />
                </Grid>
                <Grid item>
                    <Button variant='contained' startIcon={<DeleteIcon />}>Add Staff</Button>
                </Grid>
            </Grid>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size='small' aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Email</TableCell>
                            <TableCell align="right">Phone</TableCell>
                            <TableCell align="right">Position</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staffs
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.full_name}
                                    </TableCell>
                                    <TableCell align="right">{row.email}</TableCell>
                                    <TableCell align="right">{row.phone}</TableCell>
                                    <TableCell align="right">{row.position?.name}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={staffs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Container>
    );
}