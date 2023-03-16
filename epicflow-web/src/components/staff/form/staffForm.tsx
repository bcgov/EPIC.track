import React from 'react';
import { TextField, Grid, Container, FormLabel } from '@mui/material';

export default function StaffForm() {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormLabel>First Name</FormLabel>
          <TextField fullWidth />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Last Name</FormLabel>
          <TextField fullWidth />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Email</FormLabel>
          <TextField fullWidth />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Phone</FormLabel>
          <TextField fullWidth />
        </Grid>
      </Grid>
    </Container>
  );
}