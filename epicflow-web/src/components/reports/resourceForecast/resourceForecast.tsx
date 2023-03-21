import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Container, FormControl, FormLabel, Grid, MenuItem, OutlinedInput,
  Skeleton
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from '@mui/material/Select';
import MaterialReactTable from 'material-react-table';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT } from '../../../constants/application-constant';
import ReportService from '../../../services/reportService';
import { dateUtils } from '../../../utils';

export default function ResourceForecast() {
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
  // const columns = [
  //   'Project',
  //   'EA Type',
  //   'Project Phase',
  //   'EA Act',
  //   'IAAC',
  //   'Sector',
  //   'ENV Region',
  //   'NRS Region',
  //   'EPD Lead'];
  const setDynamicColumns = useCallback(() => {
    let columns = [];
    if (rfData && rfData.length > 0) {
      columns = rfData[0].months.map((rfMonth: any, index: number) => {
        return {
          header: rfMonth['label'],
          accessorFn: (row: any) => `${row.months[index].phase}`,
          Cell: ({ row }: any) => (
            <Box sx={{
              bgcolor: row.original.months[index].color,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }
            }>
              {row.original.months[index].phase}
            </Box>
          )
        }
      })
    }
    return columns;
  }, [rfData]);
  const newColumns = useMemo(
    () => [
      {
        accessorKey: 'project_name', //access nested data with dot notation
        header: 'Project'
      },
      {
        accessorKey: 'ea_type', //access nested data with dot notation
        header: 'EA Type'
      },
      {
        accessorKey: 'project_phase', //access nested data with dot notation
        header: 'Project Phase',
      },
      {
        accessorKey: 'ea_act', //access nested data with dot notation
        header: 'EA Act',
      },
      {
        accessorKey: 'iaac',
        header: 'IAAC',
      },
      {
        accessorFn: (row: any): any => `${row.type}( ${row.sub_type})`,
        accessorKey: 'sector',
        header: 'Sector',
        maxSize: 100
      },
      {
        accessorKey: 'env_region',
        header: 'ENV Region'
      },
      {
        accessorKey: 'nrs_region',
        header: 'NRS Region'
      },
      {
        accessorKey: 'work_lead',
        header: 'EPD Lead'
      },
      ...setDynamicColumns()
    ], [rfData, setDynamicColumns]
  );



  console.log(setDynamicColumns());
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
        await ReportService.fetchReportData(REPORT_TYPE.RESOURCE_FORECAST, {
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
        <MaterialReactTable
          initialState={{
            density: 'compact'
          }}
          columns={newColumns}
          enableDensityToggle={false}
          enableStickyHeader={true}
          
          data={rfData} />
      }
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