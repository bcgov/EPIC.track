import React, { useState } from 'react';
import { FormLabel, Grid, MenuItem } from '@mui/material';
import { REPORT_TYPES, REPORT_TYPE } from '../constants/application-constant';
import AnticipatedEAOSchedule from './reports/eaReferral/anticipatedEAOSchedule';
import ResourceForecast from './reports/resourceForecast/resourceForecast';
import Select from '@mui/material/Select';

export default function ReportSelector({ ...props }) {
  const [selectedReport, setSelectedReport] = useState<string>('none');
  const apiUrl = props.apiUrl;
  const reportTypeOptions = REPORT_TYPES
    .map((p, index) => (<MenuItem key={index + 1} value={p.Value}>{p.Text}</MenuItem>))
  return (
    <>
      <Grid container>
        <Grid item sm={2}>
          <FormLabel>Report</FormLabel>
        </Grid>
        <Grid item sm={5}>
          <Select value={selectedReport} onChange={(e: any) => setSelectedReport(e.target.value)}>
            <MenuItem key={0} value='none'>Select Report</MenuItem>
            {reportTypeOptions}
          </Select>
        </Grid>
      </Grid>
      {selectedReport === REPORT_TYPE.EA_REFERRAL && <AnticipatedEAOSchedule apiUrl={apiUrl} />}
      {selectedReport === REPORT_TYPE.RESOURCE_FORECAST && <ResourceForecast apiUrl={apiUrl} />}
    </>
  );
}