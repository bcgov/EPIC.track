import React from 'react';
import {
  TextField, Grid, Button, MenuItem, Backdrop, CircularProgress
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { TrackLabel } from '../shared/index';
import codeService from '../../services/codeService';
import ProjectService from '../../../services/projectService';
import { Position, Staff } from '../../models/staff';
import ControlledSelect from '../shared/controlledInputComponents/ControlledSelect';
import ControlledCheckbox from '../shared/controlledInputComponents/ControlledCheckbox';
import TrackDialog from '../shared/TrackDialog';

const schema = yup.object().shape({
  //email: yup.string().email().required('Email is required'),
  //phone: yup.string()
   // .matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/, 'Invalid phone number')
   // .required('Phone number is required'),
  project_name: yup.string().required('Project name is required'),
  //last_name: yup.string().required('Last name is required'),
  //position_id: yup.string().required('Select position')
});

export default function ProjectForm({ ...props }) {
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [staff, setStaff] = React.useState<Staff>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const staffId = props.staff_id;
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: staff
  });


  const { register, handleSubmit, formState: { errors }, reset } = methods;

  const getStaff = async (id: number) => {
    const result = await ProjectService.getProjects(id);
    if (result.status === 200) {
      setStaff((result.data as never)['staff']);
      reset((result.data as never)['staff']);
    }
  }

  React.useEffect(() => {
    if (staffId) {
      getStaff(staffId);
    }
  }, [staffId]);

  const getPositions = async () => {
    const positionResult = await codeService.getCodes('positions');
    if (positionResult.status === 200) {
      setPositions((positionResult.data as never)['codes']);
    }
  }
  React.useEffect(() => {
    getPositions();
  }, []);
  const onSubmitHandler = async (data: any) => {
    setLoading(true);
    if (staffId) {
      const result = await StaffService.updateStaff(data)
      if (result.status === 200) {
        setAlertContentText('Staff details updated');
        setOpenAlertDialog(true);
        props.onSubmitSucces();
        setLoading(false);
      }
    } else {
      const result = await StaffService.createStaff(data)
      if (result.status === 201) {
        setAlertContentText('Staff details inserted');
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    }
    reset();
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid component={'form'} id='project-form' container spacing={2} onSubmit={handleSubmit(onSubmitHandler)}>
          <Grid item xs={6}>
            <TrackLabel>Project Name</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.project_name?.message}
              helperText={errors?.project_name?.message?.toString()}
              {...register('project_name')} />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Type</TrackLabel>
            <Select 
              fullWidth 
              error={!!errors?.type?.message}
              helperText={errors?.type?.message?.toString()}
              {...register('type')}/>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Proponent</TrackLabel>
            <Select fullWidth error={!!errors?.proponent?.message}
              helperText={errors?.proponent?.message?.toString()}
              {...register('proponent')}/>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>SubType</TrackLabel>
            <Select fullWidth error={!!errors?.subtype?.message}
              helperText={errors?.subtype?.message?.toString()}
              {...register('subtype')}/>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Project Description</TrackLabel>
            <TextField
              fullWidth multiline
              {...register('project_description')}
              error={!!errors?.project_description?.message}
              helperText={errors?.project_description?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Location Description</TrackLabel>
            <TextField
              fullWidth
              {...register('location_description')}
              error={!!errors?.location_description?.message}
              helperText={errors?.location_description?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Latitude</TrackLabel>
            <TextField
              fullWidth
              {...register('latitude')}
              error={!!errors?.latitude?.message}
              helperText={errors?.latitude?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Longitude</TrackLabel>
            <TextField
              fullWidth
              {...register('longitude')}
              error={!!errors?.longitude?.message}
              helperText={errors?.longitude?.message?.toString()}
            />
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>ENV Region</TrackLabel>
            <Select fullWidth 
            {...register('env_region')}
            error={!!errors?.env_region?.message}
            helperText={errors?.env_region?.message?.toString()}
            />
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>NRS Region</TrackLabel>
            <Select fullWidth
             {...register('nrs_region')}
             error={!!errors?.nrs_region?.message}
             helperText={errors?.nrs_region?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Capital Investment</TrackLabel>
            <TextField
              fullWidth
              {...register('capital_investment')}
              error={!!errors?.capital_investment?.message}
              helperText={errors?.capital_investment?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>EPIC GUID</TrackLabel>
            <TextField
              fullWidth
              {...register('epic_guid')}
              error={!!errors?.epic_guid?.message}
              helperText={errors?.epic_guid?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Certificate Number<IconWithTooltip /></TrackLabel>
            <TextField fullWidth />
            <TrackHelperText>Provide the certificate number if available</TrackHelperText>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Abbreviation</TrackLabel>
            <TextField fullWidth 
            {...register('abbreviation')}
            error={!!errors?.abbreviation?.message}
            helperText={errors?.abbreviation?.message?.toString()}
            /> 
            <TrackHelperText>
              Abbreviation of the project name to be displayed in reports and graphs
            </TrackHelperText>
          </Grid>

          <Grid item xs={6}>
            <TrackLabel>Position</TrackLabel>
            <ControlledSelect
              error={!!errors?.position_id?.message}
              helperText={errors?.position_id?.message?.toString()}
              defaultValue={staff?.position_id}
              fullWidth {...register('position_id')}>
              {positions.map((e, index) => (<MenuItem key={index + 1} value={e.id}>{e.name}</MenuItem>))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: '30px !important' }}>
            <ControlledCheckbox
              defaultChecked={staff?.is_active}
              {...register('is_active')}
            />
            <TrackLabel id='active'>Active</TrackLabel>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', gap: '0.5rem', justifyContent: 'right' }}>
            <Button variant='outlined' type='reset' onClick={props.onCancel}>Cancel</Button>
            <Button variant='outlined' type='submit'>Submit</Button>
          </Grid>
        </Grid>
      </FormProvider>
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={'Success'}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
        onOk={() => {
          setOpenAlertDialog(false);
          props.onCancel();
        }}
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}








































//Old Code

import React from 'react'
import Grid from '@mui/material/Grid';
import HelpIcon from '@mui/icons-material/Help';

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
