import React, { useState } from 'react';
import ReportService from '../../../services/reportService';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT }
  from '../../../constants/application-constant';
import { dateUtils } from '../../../utils';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, FormLabel,
  Grid, Skeleton, Tab, Table, Tabs, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Container } from '@mui/system';

export default function AnticipatedEAOSchedule({ ...props }) {
  const [reports, setReports] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [reportDate, setReportDate] = useState<string>();
  const [resultStatus, setResultStatus] = useState<string>();

  const FILENAME_PREFIX = 'Anticipated_EA_Referral_Schedule';

  const fetchReportData = async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData =
        await ReportService.fetchReportData(props.apiUrl, REPORT_TYPE.EA_REFERRAL, {
          report_date: reportDate
        });
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        setReports(reportData.data as never);
      }

      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }

  }
  const downloadPDFReport = async () => {
    try {
      fetchReportData();
      const binaryReponse =
        await ReportService.downloadPDF(props.apiUrl, REPORT_TYPE.EA_REFERRAL, {
          report_date: reportDate
        });
      const url = window.URL.createObjectURL(new Blob([(binaryReponse as any).data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        `${FILENAME_PREFIX}-
          ${dateUtils.formatDate(reportDate ? reportDate : new Date().toISOString())}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
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
      {resultStatus === RESULT_STATUS.LOADED && <Accordion sx={{ mt: '15px' }}>
        {
          Object.keys(reports).map((key) => {
            return <>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{key}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {
                  ((reports as any)[key] as []).map((item, itemIndex) => {
                    return <Accordion key={itemIndex}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{item['project_name']}</Typography>
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
                            <tbody>
                              {item['proponent'] && <tr>
                                <td>Proponent</td>
                                <td>{item['proponent']}</td>
                              </tr>}
                              <tr>
                                <td>Region</td>
                                <td>{item['region']}</td>
                              </tr>
                              <tr>
                                <td>Location</td>
                                <td>{item['location']}</td>
                              </tr>
                              <tr>
                                <td>EA Type</td>
                                <td>
                                  {item['ea_act']}
                                  {item['substitution_act'] ? ', ' + item['substitution_act'] : ''}
                                </td>
                              </tr>
                              <tr>
                                <td>Responsible Minister</td>
                                <td>{item['ministry_name']}</td>
                              </tr>
                              <tr>
                                <td>Decision to be made by</td>
                                <td>{item['decision_by']}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </TabPanel>
                        <TabPanel value={selectedTab} index={1}>
                          {item['project_description']}
                        </TabPanel>
                        <TabPanel value={selectedTab} index={2}>
                          <Table>
                            <tbody>
                              <tr>
                                <td>
                                  {item['milestone_type'] === 4 ?
                                    'Referral Date' : 'Decision Date'}
                                </td>
                                <td>{dateUtils.formatDate(item['referral_date'])}</td>
                              </tr>
                              <tr>
                                <td>Updated Date</td>
                                <td>{dateUtils.formatDate(item['date_updated'])}</td>
                              </tr>
                              {
                                item['next_pecp_date'] &&
                                <tr>
                                  <td>Next PECP Date</td>
                                  <td>{dateUtils.formatDate(item['next_pecp_date'])}</td>
                                </tr>
                              }
                              {
                                item['next_pecp_title'] &&
                                <tr>
                                  <td>PECP Title</td>
                                  <td>{item['next_pecp_title']}</td>
                                </tr>
                              }
                              {
                                item['next_pecp_short_description'] !== null &&
                                <tr>
                                  <td>PECP Description</td>
                                  <td>{item['next_pecp_short_description']}</td>
                                </tr>
                              }
                              <tr>
                                <td>Additional Info</td>
                                <td>{item['additional_info']}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </TabPanel>
                      </AccordionDetails>
                    </Accordion>
                  })
                }
              </AccordionDetails>
            </>
          })

        }
      </Accordion>
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