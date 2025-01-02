import React from "react";
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
import { If } from "react-if";

interface Group {
  group: string;
  items: any[];
}

interface Period {
  [key: string]: Group[];
}

interface ReportData {
  data: Period;
}

const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];
export default function ThirtySixtyNinety() {
  const [reports, setReports] = React.useState<Period>();
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
        const result = (reportData.data as ReportData).data;
        // Iterate through each period: "30", "60", "90"
        Object.keys(result).forEach((key: string) => {
          const periodGroups = result[key] as Group[];
          periodGroups.forEach((group) => {
            // Check and set staleness for each work issue in the work
            (group.items[0].work_issues as any[]).forEach((workIssue) => {
              const staleness = stalenessLevel(workIssue);
              workIssue.staleness =
                staleness === StalenessEnum.CRITICAL
                  ? StalenessEnum.CRITICAL
                  : staleness === StalenessEnum.WARN
                  ? StalenessEnum.WARN
                  : StalenessEnum.GOOD;
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

  const isIssueStaleIndicatorRequired = (reportItem: any) => {
    return (reportItem["work_issues"] as []).some((workIssue) =>
      [StalenessEnum.CRITICAL, StalenessEnum.WARN].includes(
        stalenessLevel(workIssue)
      )
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

  const overallStalenessLevel = (
    status_staleness: string,
    work_issues: any
  ) => {
    const issuesStaleness = new Set(
      work_issues.map((issue: any) => issue.staleness)
    );

    if (
      status_staleness === StalenessEnum.CRITICAL ||
      issuesStaleness.has(StalenessEnum.CRITICAL)
    ) {
      return StalenessEnum.CRITICAL;
    } else if (
      status_staleness === StalenessEnum.WARN ||
      issuesStaleness.has(StalenessEnum.WARN)
    ) {
      return StalenessEnum.WARN;
    } else if (
      status_staleness === StalenessEnum.GOOD ||
      issuesStaleness.has(StalenessEnum.GOOD)
    ) {
      return StalenessEnum.GOOD;
    }
    return StalenessEnum.CRITICAL;
  };

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
          reports &&
          Object.keys(reports).map((key) => {
            return (
              <>
                <Accordion sx={{ mt: "15px" }} expanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{key}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Iterate over groups within the period */}
                    {reports[key].map((group, groupIndex) => {
                      const item = group.items[0];
                      const itemIndex = groupIndex;
                      return (
                        <Accordion key={itemIndex}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              <Chip
                                style={{
                                  marginRight: "0.5rem",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  width: "100px",
                                  ...staleLevel(
                                    overallStalenessLevel(
                                      item["status_staleness"],
                                      item["work_issues"]
                                    )
                                  ),
                                }}
                                label={
                                  <>
                                    <b>
                                      {item["oldest_update"] && reportDate
                                        ? dateUtils
                                            .diff(
                                              reportDate,
                                              item["oldest_update"],
                                              "days"
                                            )
                                            .toString()
                                            .concat(" days ago")
                                        : "Needs Status"}
                                    </b>
                                  </>
                                }
                              />
                              {item["project_name"]} - {item["event_title"]}:{" "}
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
                              <Tab
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "0.5rem",
                                }}
                                label={
                                  <>
                                    Status
                                    {item["status_staleness"] ===
                                      StalenessEnum.CRITICAL && (
                                      <IndicatorIcon />
                                    )}
                                  </>
                                }
                              />
                              <Tab
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "0.5rem",
                                }}
                                label={
                                  <>
                                    Issues
                                    {isIssueStaleIndicatorRequired(item) && (
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
                                      {item["event_type"] === "work_issue"
                                        ? "Work Issue Update Date"
                                        : "Anticipated Decision Date"}{" "}
                                    </TableCell>
                                    <TableCell>
                                      {dateUtils.formatDate(
                                        item["event_date"],
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
                              <If condition={item["status_date_updated"]}>
                                <Chip
                                  style={{
                                    marginRight: "0.5rem",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    width: "100px",
                                    ...staleLevel(item["status_staleness"]),
                                  }}
                                  label={
                                    <>
                                      <b>
                                        {dateUtils.formatDate(
                                          item["status_date_updated"],
                                          DISPLAY_DATE_FORMAT
                                        )}
                                      </b>
                                    </>
                                  }
                                />
                              </If>

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
