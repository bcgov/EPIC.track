import React from "react";
import Grid from "@mui/material/Grid";
import HelpIcon from "@mui/icons-material/Help";

import {
  Button,
  Checkbox,
  DialogContent,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";

export default function ProjectForm() {
  const IconWithTooltip = () => (
    <Tooltip
      title="You should be getting a certificate number 
    if the assessment of the project has completed."
      placement="right-end"
    >
      <HelpIcon fontSize="small" color="primary" />
    </Tooltip>
  );

  return (
    <>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormLabel required color="error">
              Project Name{" "}
            </FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>Type</FormLabel>
            <Select fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>Proponent</FormLabel>
            <Select fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>SubType</FormLabel>
            <Select fullWidth />
          </Grid>
          <Grid item xs={12}>
            <FormLabel>Project Description</FormLabel>
            <TextField fullWidth multiline rows={4} />
          </Grid>
          <Grid item xs={12}>
            <FormLabel>Location Description</FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>Latitude</FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>Longitude</FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={4}>
            <FormLabel>ENV Region</FormLabel>
            <Select fullWidth />
          </Grid>
          <Grid item xs={4}>
            <FormLabel>FLNR Region</FormLabel>
            <Select fullWidth />
          </Grid>
          <Grid item xs={4}>
            <FormLabel>Capital Investment</FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>EPIC GUID</FormLabel>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <FormLabel>
              Certificate Number
              <IconWithTooltip />
            </FormLabel>
            <TextField fullWidth />
            <FormHelperText>
              Provide the certificate number if available
            </FormHelperText>
          </Grid>
          <Grid item xs={6}>
            <FormLabel>Abbreviation</FormLabel>
            <TextField fullWidth />{" "}
            <FormHelperText>
              Abbreviation of the project name to be displayed in reports and
              graphs
            </FormHelperText>
          </Grid>
          <Grid item xs={3}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Is the Project Closed?"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={3}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Is Active"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={8}>
            <Button>Cancel</Button>
            <Button color="primary" variant="contained">
              Submit
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
}
