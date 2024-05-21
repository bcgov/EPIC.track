import React, { useCallback, useMemo } from "react";
import { Container } from "@mui/system";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReportService from "../../../services/reportService";
import {
  RESULT_STATUS,
  REPORT_TYPE,
  DISPLAY_DATE_FORMAT,
  StalenessEnum,
  REPORT_STALENESS_THRESHOLD,
} from "../../../constants/application-constant";
import { dateUtils } from "../../../utils";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import ReportHeader from "../shared/report-header/ReportHeader";
import { ETPageContainer } from "../../shared";
import { staleLevel } from "utils/uiUtils";

const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];
export default function ThirtySixtyNinety() {
  const [reports, setReports] = React.useState({});
  const [showReportDateBanner, setShowReportDateBanner] =
    React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [reportDate, setReportDate] = React.useState<string>();
  const [resultStatus, setResultStatus] = React.useState<string>();
  const FILENAME_PREFIX = "30_60_90_Report";
  React.useEffect(() => {
    const diff = dateUtils.diff(
      reportDate || "",
      new Date(2019, 11, 19).toISOString(),
      "days"
    );
    setShowReportDateBanner(diff < 0 && !Number.isNaN(diff));
  }, [reportDate]);
  const fetchReportData = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData = await ReportService.fetchReportData(
        REPORT_TYPE.REPORT_30_60_90,
        {
          report_date: reportDate,
        }
      );
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        const result = (reportData.data as never)["data"];
        Object.keys(result).forEach((key) => {
          (result[key] as []).forEach((resultItem: any) => {
            (resultItem.work_issues as []).forEach((workIssue: any) => {
              if (stalenessLevel(workIssue) === StalenessEnum.CRITICAL)
                workIssue["staleness"] = StalenessEnum.CRITICAL;
              else if (stalenessLevel(workIssue) === StalenessEnum.WARN)
                workIssue["staleness"] = StalenessEnum.WARN;
              else workIssue["staleness"] = StalenessEnum.GOOD;
            });
          });
        });
        setReports(result);
      }
      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }, [reportDate]);

  const isStaleIndicatorRequired = (reportItem: any) => {
    return (reportItem["work_issues"] as []).some(
      (workIssue) => stalenessLevel(workIssue) === StalenessEnum.CRITICAL
    );
  };
  const stalenessLevel = (workIssue: any) => {
    const stalenessThreshold =
      REPORT_STALENESS_THRESHOLD[REPORT_TYPE.REPORT_30_60_90];
    const diffDays = dateUtils.diff(
      reportDate || "",
      workIssue["latest_update"]["posted_date"],
      "days"
    );
    if (diffDays > stalenessThreshold[StalenessEnum.CRITICAL])
      return StalenessEnum.CRITICAL;
    else if (diffDays > stalenessThreshold[StalenessEnum.WARN])
      return StalenessEnum.WARN;
    else return StalenessEnum.GOOD;
  };

  const downloadPDFReport = React.useCallback(async () => {
    try {
      fetchReportData();
      const binaryReponse = await ReportService.downloadPDF(
        REPORT_TYPE.REPORT_30_60_90,
        {
          report_date: reportDate,
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${FILENAME_PREFIX}-
          ${dateUtils.formatDate(
            reportDate ? reportDate : new Date().toISOString()
          )}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }, [reportDate, fetchReportData]);

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
    <ETPageContainer
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      container
      columnSpacing={2}
      rowSpacing={3}
    >
      <Grid item sm={12}>
        <ReportHeader
          setReportDate={setReportDate}
          fetchReportData={fetchReportData}
          downloadPDFReport={downloadPDFReport}
          showReportDateBanner={showReportDateBanner}
        />
      </Grid>
      <Grid item sm={12}>
        {resultStatus === RESULT_STATUS.LOADED &&
          Object.keys(reports).map((key) => {
            return (
              <>
                <Accordion sx={{ mt: "15px" }} expanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{key}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {((reports as any)[key] as []).map((item, itemIndex) => {
                      return (
                        <Accordion key={itemIndex}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              {item["project_name"]} - {item["event_title"]}:
                              {dateUtils.formatDate(
                                item["event_date"],
                                DISPLAY_DATE_FORMAT
                              )}
                            </Typography>
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
                              <Tab
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "0.5rem",
                                }}
                                label={
                                  <>
                                    Issues
                                    {isStaleIndicatorRequired(item) && (
                                      <IndicatorIcon />
                                    )}
                                  </>
                                }
                              />
                              <Tab label="Decision Information" />
                            </Tabs>
                            <TabPanel value={selectedTab} index={0}>
                              <Table>
                                <TableBody>
                                  {item["project_name"] && (
                                    <TableRow>
                                      <TableCell>Project Name</TableCell>
                                      <TableCell>
                                        {item["project_name"]}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell>Work Report Title</TableCell>
                                    <TableCell>
                                      {item["work_report_title"]}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      Anticipated Decision Date
                                    </TableCell>
                                    <TableCell>
                                      {dateUtils.formatDate(
                                        item["anticipated_decision_date"],
                                        DISPLAY_DATE_FORMAT
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TabPanel>
                            <TabPanel value={selectedTab} index={1}>
                              {item["work_short_description"]}
                            </TabPanel>
                            <TabPanel value={selectedTab} index={2}>
                              {item["work_status_text"]}
                            </TabPanel>
                            <TabPanel value={selectedTab} index={3}>
                              <Grid
                                container
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  gap: "1rem",
                                }}
                              >
                                {(item["work_issues"] as []).map((issue) => (
                                  <Box>
                                    <Grid container>
                                      <Grid item xs={2}>
                                        <Chip
                                          style={{
                                            marginRight: "0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            width: "100px",
                                            ...staleLevel(issue["staleness"]),
                                          }}
                                          label={
                                            <>
                                              <b>
                                                {dateUtils.formatDate(
                                                  issue["latest_update"][
                                                    "posted_date"
                                                  ],
                                                  DISPLAY_DATE_FORMAT
                                                )}
                                              </b>
                                            </>
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={10}>
                                        {issue["title"]}
                                      </Grid>
                                      <Grid item xs={12}>
                                        {issue["latest_update"]["description"]}
                                      </Grid>
                                    </Grid>
                                    <Divider flexItem />
                                  </Box>
                                ))}
                              </Grid>
                            </TabPanel>
                            <TabPanel value={selectedTab} index={4}>
                              {item["decision_information"]}
                            </TabPanel>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </>
            );
          })}

        {resultStatus === RESULT_STATUS.NO_RECORD && (
          <Container>
            <Alert severity="warning">No Records Found</Alert>
          </Container>
        )}
        {resultStatus === RESULT_STATUS.ERROR && (
          <Container>
            <Alert severity="error">
              Error occured during processing. Please try again after some time.
            </Alert>
          </Container>
        )}
        {resultStatus === RESULT_STATUS.LOADING && (
          <>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation={false} />
          </>
        )}
      </Grid>
    </ETPageContainer>
  );
}
