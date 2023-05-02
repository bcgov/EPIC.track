import { Grid, FormLabel, TextField, Select, FormGroup, FormControlLabel, Checkbox, Button } from "@mui/material";

export default function IndegenousNationForm() {
	return (
		<>
		    <Grid container spacing={2}>
			 <Grid item xs={6}>
			   <FormLabel required color='error'> Name </FormLabel>
			   <TextField fullWidth />
			 </Grid>
			 <Grid item xs={6}>
			   <FormLabel>Relationship Holder</FormLabel>
			   <Select fullWidth />
			 </Grid>
			 <Grid item xs={3}>
			   <FormGroup>
				<FormControlLabel
				  control={<Checkbox defaultChecked />} label="Is Active" />
			   </FormGroup>
			 </Grid>
			 <Grid item xs={8}>
			   <Button>Cancel</Button>
			   <Button color="primary" variant="contained">
				Submit
			   </Button>
			 </Grid>
		    </Grid>

		</>
	   );
	 }