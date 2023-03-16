import React, { useState } from 'react';
import {
  Alert, Button, Container, FormControl, FormLabel, Grid, MenuItem, OutlinedInput,
  Skeleton, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT } from '../../../constants/application-constant';
import ReportService from '../../../services/reportService';
import { dateUtils } from '../../../utils';
import Select from '@mui/material/Select';

export default function ResourceForecast({ ...props }) {
  const [reportDate, setReportDate] = useState<string>();
  const [resultStatus, setResultStatus] = useState<string>();
  const [rfData, setRFData] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilter] = useState<string[]>([]);

  const filters = [
    {
      label: 'Capital Investment',
      value: 'capital_investment'
    },
    {
      label: 'Responsible EPD',
      value: 'responsible_epd'
    },
    {
      label: 'EAO Team',
      value: 'eao_team'
    },
    {
      label: 'Work Team Members',
      value: 'work_team_members'
    },
    {
      label: 'Referral Timing',
      value: 'referral_timing'
    }];
  const columns = [
    'Project',
    'EA Type',
    'Project Phase',
    'EA Act',
    'IAAC',
    'Sector',
    'ENV Region',
    'NRS Region',
    'EPD Lead'];

  const getSelectedFilterLabels = (selected: string[]) => {
    const labels = selected.map(val => {
      return filters.filter(p => p.value === val)[0].label
    });
    return labels;
  }
  const fetchReportData = async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData =
        await ReportService.fetchReportData(props.apiUrl, REPORT_TYPE.RESOURCE_FORECAST, {
          report_date: reportDate,
          filters: {
            exclude: selectedFilters
          }
        });
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        setRFData((reportData.data as never)['data']);
      }
      console.log(rfData);
      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }
  return (
    <>
      <Grid component="form" onSubmit={(e) => e.preventDefault()}
        container spacing={2} sx={{ marginTop: '5px' }}>
        <Grid item sm={2}><FormLabel>Report Date</FormLabel></Grid>
        <Grid item sm={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker format={DATE_FORMAT}
              onChange={(dateVal: any) => setReportDate(dateUtils.formatDate(dateVal.$d))}
              slotProps={{
                textField: {
                  id: 'ReportDate'
                }
              }} />
          </LocalizationProvider>
        </Grid>
        <Grid item sm={2}><FormLabel>Filter</FormLabel></Grid>
        <Grid item sm={2}>
          <FormControl sx={{ width: 300 }}>
            <Select
              multiple
              value={selectedFilters}
              input={<OutlinedInput />}
              onChange={(e: any) => setSelectedFilter(e.target.value)}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Placeholder</em>;
                }

                return getSelectedFilterLabels(selected).join(', ');
              }}
            >
              {
                filters.map(filter => (
                  <MenuItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </MenuItem>
                )
                )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item sm={resultStatus === RESULT_STATUS.LOADED ? 3 : 4}>
          <Button variant='contained'
            type='submit'
            onClick={fetchReportData}
            sx={{ float: 'right' }}>Submit
          </Button>
        </Grid>
        <Grid item sm={1}>
          {resultStatus === RESULT_STATUS.LOADED &&
            <Button variant='contained'>Download</Button>}
        </Grid>
      </Grid>
      {resultStatus === RESULT_STATUS.LOADED &&
        rfData &&
        rfData.length > 0 &&
        <Table sx={{ mt: '15px' }}>
          <TableHead
            sx={{
              bgcolor: '#ebe6e6',
              '& th': {
                fontWeight: '600'
              }
            }}>
            <TableRow>
              {columns
                .map((col, colIndex) => <TableCell key={colIndex}>{col}</TableCell>)}
              {
                (rfData[0]['months'] as []).map((rfMonth, rfMonthIndex) => (
                  <TableCell key={rfMonthIndex}>
                    {rfMonth['label']}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {rfData.map((rf, rfIndex) => (
              <TableRow key={rfIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  {rf['project_name']}
                </TableCell>
                <TableCell>
                  {rf['ea_type']}
                </TableCell>
                <TableCell>
                  {rf['project_phase']}
                </TableCell>
                <TableCell>
                  {rf['ea_act']}
                </TableCell>
                <TableCell>
                  {rf['iaac']}
                </TableCell>
                <TableCell>
                  {`${rf['type']} (${rf['sub_type']})`}
                </TableCell>
                <TableCell>
                  {rf['env_region']}
                </TableCell>
                <TableCell>
                  {rf['nrs_region']}
                </TableCell>
                <TableCell>
                  {rf['work_lead']}
                </TableCell>
                <TableCell style={{ background: rf['months'][0]['color'] }}>
                  {rf['months'][0]['phase']}
                </TableCell>
                <TableCell style={{ background: rf['months'][1]['color'] }}>
                  {rf['months'][1]['phase']}
                </TableCell>
                <TableCell style={{ background: rf['months'][2]['color'] }}>
                  {rf['months'][2]['phase']}
                </TableCell>
                <TableCell style={{ background: rf['months'][3]['color'] }}>
                  {rf['months'][3]['phase']}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      {resultStatus === RESULT_STATUS.NO_RECORD &&
        <Container>
          <Alert severity="warning">
            No Records Found
          </Alert>
        </Container>}
      {resultStatus === RESULT_STATUS.ERROR &&
        <Container>
          <Alert severity="error">
            Error occured during processing. Please try again after some time.
          </Alert>
        </Container>}
      {resultStatus === RESULT_STATUS.LOADING &&
        <>
          <Skeleton />
          <Skeleton animation="wave" />
          <Skeleton animation={false} />
        </>
      }
    </>
  );
}