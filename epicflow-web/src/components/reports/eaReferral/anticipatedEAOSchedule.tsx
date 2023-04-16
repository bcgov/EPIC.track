import React from 'react';
import { Container } from '@mui/system';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, FormLabel,
  Grid, Skeleton, Tab, Table, TableBody, TableCell, TableRow, Tabs, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowForwardIosSharpIcon  from '@mui/icons-material/ArrowForwardIosSharp';
import ReportService from '../../../services/reportService';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT }
  from '../../../constants/application-constant';
import { dateUtils } from '../../../utils';
import EFChip from '../../shared/efChip';
import moment from 'moment';

export default function AnticipatedEAOSchedule() {
  const [reports, setReports] = React.useState({});
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [reportDate, setReportDate] = React.useState<string>();
  const [resultStatus, setResultStatus] = React.useState<string>();

  const FILENAME_PREFIX = 'Anticipated_EA_Referral_Schedule';

  const fetchReportData = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData =
        await ReportService.fetchReportData(REPORT_TYPE.EA_REFERRAL, {
          report_date: reportDate
        });
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        setReports((reportData.data as never)['data']);
      }

      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }

  },[reportDate]);
  const downloadPDFReport = React.useCallback(async () => {
    try {
      fetchReportData();
      const binaryReponse =
        await ReportService.downloadPDF(REPORT_TYPE.EA_REFERRAL, {
          report_date: reportDate
        });
      const url = window.URL.createObjectURL(new Blob([(binaryReponse as any).data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        `${FILENAME_PREFIX}-${dateUtils.formatDate(reportDate ? reportDate :
          new Date().toISOString())}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  },[reportDate, fetchReportData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const staleLevel = React.useCallback((date: string)=>{
    const dateObj = moment(date);
    const diff = dateObj.diff(moment(),'days');
    console.log(date,diff);
    return diff >=0 ? 'rgb(46, 125, 50, 0.1)': (diff == -1)? 'rgb(237, 108, 2, 0.1)': 'rgba(213, 4, 4, 0.1)';
  }, [])

  interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  return (
    <>
      <Grid component="form" onSubmit={(e) => e.preventDefault()}
        container spacing={2} sx={{ marginTop: '5px' }}>
        <Grid item sm={2}><FormLabel>Report Date</FormLabel></Grid>
        <Grid item sm={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker format={DATE_FORMAT}
              onChange={(dateVal: any) =>
                setReportDate(dateUtils.formatDate(dateVal.$d))}
              slotProps={{
                textField: {
                  id: 'ReportDate'
                }
              }} />
          </LocalizationProvider>
        </Grid>
        <Grid item sm={resultStatus === RESULT_STATUS.LOADED ? 7 : 8}>
          <Button variant='contained' type='submit'
            onClick={fetchReportData} sx={{ float: 'right' }}>Submit</Button>
        </Grid>
        <Grid item sm={1}>
          {resultStatus === RESULT_STATUS.LOADED &&
            <Button variant='contained' onClick={downloadPDFReport}>Download</Button>}
        </Grid>
      </Grid>
      {resultStatus === RESULT_STATUS.LOADED &&
        Object.keys(reports).map((key) => {
          console.log(key);
          return <>
            <Accordion sx={{ mt: '15px',bgcolor: 'rgba(0, 0, 0, .03)' }} square disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ArrowForwardIosSharpIcon />}>
                <Typography>{key}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {
                  ((reports as any)[key] as []).map((item, itemIndex) => {
                    return <Accordion key={itemIndex} elevation={0}>
                      <AccordionSummary expandIcon={<ArrowForwardIosSharpIcon />}>
                        <Typography>
                          <EFChip style={{
                            marginRight: '0.5rem',
                            backgroundColor: `${staleLevel(item['date_updated'])}`
                          }} label={<>
                            <b>{item['date_updated']}</b>
                          </>} />
                          {item['project_name']}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Tabs
                          id={itemIndex.toString()}
                          onChange={handleTabChange}
                          value={selectedTab}
                        >
                          <Tab label="Basic" />
                          <Tab label="Project Description" />
                          <Tab label="Anticipated Referral Date/Next PCP/Additional Information" />
                        </Tabs>
                        <TabPanel value={selectedTab} index={0}>
                          <Table>
                            <TableBody>
                              {item['proponent'] && <TableRow>
                                <TableCell>Proponent</TableCell>
                                <TableCell>{item['proponent']}</TableCell>
                              </TableRow>}
                              <TableRow>
                                <TableCell>Region</TableCell>
                                <TableCell>{item['region']}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Location</TableCell>
                                <TableCell>{item['location']}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>EA Type</TableCell>
                                <TableCell>
                                  {item['ea_act']}
                                  {item['substitution_act'] ? ', ' + item['substitution_act'] : ''}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Responsible Minister</TableCell>
                                <TableCell>{item['ministry_name']}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Decision to be made by</TableCell>
                                <TableCell>{item['decision_by']}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TabPanel>
                        <TabPanel value={selectedTab} index={1}>
                          {item['project_description']}
                        </TabPanel>
                        <TabPanel value={selectedTab} index={2}>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  {item['milestone_type'] === 4 ?
                                    'Referral Date' : 'Decision Date'}
                                </TableCell>
                                <TableCell>{dateUtils.formatDate(item['referral_date'])}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Updated Date</TableCell>
                                <TableCell>{dateUtils.formatDate(item['date_updated'])}</TableCell>
                              </TableRow>
                              {
                                item['next_pecp_date'] &&
                                <TableRow>
                                  <TableCell>Next PECP Date</TableCell>
                                  <TableCell>{dateUtils.formatDate(item['next_pecp_date'])}</TableCell>
                                </TableRow>
                              }
                              {
                                item['next_pecp_title'] &&
                                <TableRow>
                                  <TableCell>PECP Title</TableCell>
                                  <TableCell>{item['next_pecp_title']}</TableCell>
                                </TableRow>
                              }
                              {
                                item['next_pecp_short_description'] !== null &&
                                <TableRow>
                                  <TableCell>PECP Description</TableCell>
                                  <TableCell>{item['next_pecp_short_description']}</TableCell>
                                </TableRow>
                              }
                              <TableRow>
                                <TableCell>Additional Info</TableCell>
                                <TableCell>{item['additional_info']}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TabPanel>
                      </AccordionDetails>
                    </Accordion>
                  })
                }
              </AccordionDetails>
            </Accordion>
          </>
        })
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
  )
}