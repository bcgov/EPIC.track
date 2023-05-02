import React from 'react';
import { Alert, Button, FormLabel, Grid } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DATE_FORMAT } from '../../../../constants/application-constant';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { dateUtils } from '../../../../utils';

const ReportHeader = ({ ...props }) => {
  const STALE_DATE_BANNER = 
  'Currently EPIC.track only contains EA Act (2018) data and can\'t produce reports dated before January 2020';
  return (
    <>
      <Grid component="form" onSubmit={(e) => e.preventDefault()}
        container spacing={2} sx={{ marginTop: '5px' }}>
        <Grid item sm={2}><FormLabel>Report Date</FormLabel></Grid>
        <Grid item sm={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker format={DATE_FORMAT}
              onChange={(dateVal: any) =>
                props.setReportDate(dateUtils.formatDate(dateVal.$d))}
              slotProps={{
                textField: {
                  id: 'ReportDate'
                }
              }} />
          </LocalizationProvider>
        </Grid>
        <Grid item sm={7}>
          <Button variant='contained' type='submit'
            onClick={props.fetchReportData} sx={{ float: 'right' }}>Submit</Button>
        </Grid>
        <Grid item sm={1}>
          <Button variant='contained' onClick={props.downloadPDFReport}>Download</Button>
        </Grid>
      </Grid>
      {props.showReportDateBanner && <Alert severity="warning">
        {STALE_DATE_BANNER}
      </Alert>}
    </>
  )
}

export default ReportHeader;