import React from 'react';
import { Container } from '@mui/system';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, FormLabel,
  Grid, Skeleton, Tab, Table, TableBody, TableCell, TableRow, Tabs, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportService from '../../../services/reportService';
import { RESULT_STATUS, REPORT_TYPE, DATE_FORMAT }
  from '../../../constants/application-constant';
import { dateUtils } from '../../../utils';

export default function ReportSample() {
  const [reports, setReports] = React.useState({});
  const [showReportDateBanner, setShowReportDateBanner] = React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [reportDate, setReportDate] = React.useState<string>();
  const [resultStatus, setResultStatus] = React.useState<string>();


  const FILENAME_PREFIX = '30_60_90_Report';
  React.useEffect(()=>{
    const diff = dateUtils.diff(reportDate || '',new Date(2019,11,19).toISOString(),'days')
    setShowReportDateBanner(diff<0 && !Number.isNaN(diff));
  },[reportDate]);
  const fetchReportData = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData =
        await ReportService.fetchReportData(REPORT_TYPE.REPORT_30_60_90, {
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

  },[reportDate]);
  const downloadPDFReport = React.useCallback(async () => {
    try {
      fetchReportData();
      const binaryReponse =
        await ReportService.downloadPDF(REPORT_TYPE.REPORT_30_60_90, {
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
  },[reportDate]);

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
      {showReportDateBanner && <Alert severity="warning">
      Currently EPIC.track only contains EA Act (2018) data and can&apost produce reports dated before January 2020
      </Alert>}
      {resultStatus === RESULT_STATUS.LOADED &&
        Object.keys(reports).map((key) => {
          console.log(key);
          return <>
            <Accordion sx={{ mt: '15px' }}><AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{key}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {
                ((reports as any)[key] as []).map((item, itemIndex) => {
                  console.log(itemIndex);
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
                        <Tab label="Work Short Description" />
                        <Tab label="Status" />
                        <Tab label="Decision Information" />
                      </Tabs>
                      <TabPanel value={selectedTab} index={0}>
                        <Table>
                          <TableBody>
                            {item['project_name'] && <TableRow>
                              <TableCell>Project Name</TableCell>
                              <TableCell>{item['project_name']}</TableCell>
                            </TableRow>}
                            <TableRow>
                              <TableCell>Work Report Title</TableCell>
                              <TableCell>{item['work_report_title']}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Anticipated Decision Date</TableCell>
                              <TableCell>{item['anticipated_decision_date']}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TabPanel>
                      <TabPanel value={selectedTab} index={1}>
                        {item['work_short_description']}
                      </TabPanel>
                      <TabPanel value={selectedTab} index={1}>
                        {item['work_status_text']}
                      </TabPanel>
                      <TabPanel value={selectedTab} index={1}>
                        {item['decision_information']}
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