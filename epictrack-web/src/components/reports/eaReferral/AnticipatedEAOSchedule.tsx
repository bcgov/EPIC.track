import React from "react";
import { Container } from "@mui/system";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormLabel,
  Grid,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import ReportService from "../../../services/reportService";
import {
  RESULT_STATUS,
  REPORT_TYPE,
  DISPLAY_DATE_FORMAT,
  MILESTONE_TYPES,
} from "../../../constants/application-constant";
import { dateUtils } from "../../../utils";
import moment from "moment";
import ReportHeader from "../shared/report-header/ReportHeader";
import { ETPageContainer } from "../../shared";
import { Palette } from "styles/theme";
import { staleLevel } from "utils/uiUtils";

export default function AnticipatedEAOSchedule() {
  const [reports, setReports] = React.useState({});
  const [showReportDateBanner, setShowReportDateBanner] =
    React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [reportDate, setReportDate] = React.useState<string>();
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  const FILENAME_PREFIX = "Anticipated_EA_Referral_Schedule";
  React.useEffect(() => {
    const diff = dateUtils.diff(
      reportDate || "",
      new Date(2019, 11, 19).toISOString(),
      "days"
    );
    setShowReportDateBanner(diff < 0 && !Number.isNaN(diff));
  }, [reportDate]);

  React.useEffect(() => {
    const filterTypes = Object.keys(reports).filter(
      (ele, index, arr) => arr.findIndex((t) => t === ele) === index
    );
    setTypeFilter(filterTypes);
  }, [reports]);
  const fetchReportData = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const reportData = await ReportService.fetchReportData(
        REPORT_TYPE.EA_REFERRAL,
        {
          report_date: reportDate,
        }
      );
      setResultStatus(RESULT_STATUS.LOADED);
      if (reportData.status === 200) {
        setReports((reportData.data as never)["data"]);
      }

      if (reportData.status === 204) {
        setResultStatus(RESULT_STATUS.NO_RECORD);
      }
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }, [reportDate]);
  const downloadPDFReport = React.useCallback(async () => {
    try {
      fetchReportData();
      let filtersToSend = {};

      if (selectedTypes.length > 0) {
        filtersToSend = { exclude: selectedTypes };
      }
      const binaryReponse = await ReportService.downloadPDF(
        REPORT_TYPE.EA_REFERRAL,
        {
          report_date: reportDate,
          filters: filtersToSend,
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${FILENAME_PREFIX}-${dateUtils.formatDate(
          reportDate ? reportDate : new Date().toISOString()
        )}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setResultStatus(RESULT_STATUS.ERROR);
    }
  }, [reportDate, fetchReportData, selectedTypes]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // const staleLevel = React.useCallback(
  //   (staleness: string) => {
  //     if (staleness == StalenessEnum.CRITICAL) {
  //       return {
  //         background: Palette.error.main,
  //       };
  //     } else if (staleness == StalenessEnum.WARN) {
  //       return {
  //         background: Palette.secondary.main,
  //       };
  //     } else {
  //       return {
  //         background: Palette.success.main,
  //       };
  //     }
  //   },
  //   [reportDate]
  // );

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
        {" "}
        <ReportHeader
          setReportDate={setReportDate}
          fetchReportData={fetchReportData}
          downloadPDFReport={downloadPDFReport}
          showReportDateBanner={showReportDateBanner}
        />
      </Grid>
      {Object.keys(reports).length > 0 && (
        <>
          <Grid item sm={2}>
            <FormLabel>Select Type to Hide</FormLabel>
          </Grid>
          <Grid item sm={2}>
            <Autocomplete
              sx={{
                [`& .MuiInputBase-root`]: {
                  padding: "5px",
                  border: "1px solid",
                  borderColor: "black",
                  borderRadius: "4px",
                },
              }}
              autoFocus
              multiple
              value={selectedTypes}
              onChange={(e, value) => {
                setSelectedTypes(value);
              }}
              options={typeFilter}
              renderInput={(params) => (
                <TextField {...params} variant="standard" />
              )}
            />
          </Grid>
        </>
      )}
      <Grid item sm={12}>
        {resultStatus === RESULT_STATUS.LOADED &&
          Object.keys(reports)
            .filter((key) => !selectedTypes.includes(key))
            .map((key) => {
              return (
                <>
                  <Accordion
                    sx={{ mt: "15px", bgcolor: "rgba(0, 0, 0, .03)" }}
                    square
                    disableGutters
                    defaultExpanded
                    expanded
                    elevation={0}
                  >
                    <AccordionSummary expandIcon={<ArrowForwardIosSharpIcon />}>
                      <Typography>{key}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {((reports as any)[key] as []).map((item, itemIndex) => {
                        return (
                          <Accordion key={itemIndex} elevation={0}>
                            <AccordionSummary
                              expandIcon={<ArrowForwardIosSharpIcon />}
                            >
                              <Typography>
                                <Chip
                                  style={{
                                    marginRight: "0.5rem",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    width: "100px",
                                    ...staleLevel(item["staleness"]),
                                  }}
                                  label={
                                    <>
                                      <b>
                                        {item["date_updated"]
                                          ? dateUtils.formatDate(
                                              item["date_updated"],
                                              DISPLAY_DATE_FORMAT
                                            )
                                          : "Needs Status"}
                                      </b>
                                    </>
                                  }
                                />
                                {item["project_name"]}
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
                                    {item["proponent"] && (
                                      <TableRow>
                                        <TableCell>Proponent</TableCell>
                                        <TableCell>
                                          {item["proponent"]}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow>
                                      <TableCell>Region</TableCell>
                                      <TableCell>{item["region"]}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Location</TableCell>
                                      <TableCell>{item["location"]}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>EA Type</TableCell>
                                      <TableCell>
                                        {item["ea_act"]}
                                        {item["substitution_act"]
                                          ? ", " + item["substitution_act"]
                                          : ""}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Responsible Minister
                                      </TableCell>
                                      <TableCell>
                                        {item["ministry_name"]}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Decision to be made by
                                      </TableCell>
                                      <TableCell>
                                        {item["decision_by"]}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabPanel>
                              <TabPanel value={selectedTab} index={1}>
                                {item["project_description"]}
                              </TabPanel>
                              <TabPanel value={selectedTab} index={2}>
                                <Table>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>
                                        {item["milestone_type"] ===
                                        MILESTONE_TYPES.REFERRAL
                                          ? "Referral Date"
                                          : "Decision Date"}
                                      </TableCell>
                                      <TableCell>
                                        {dateUtils.formatDate(
                                          item["referral_date"],
                                          DISPLAY_DATE_FORMAT
                                        )}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Updated Date</TableCell>
                                      <TableCell>
                                        {item["date_updated"]
                                          ? dateUtils.formatDate(
                                              item["date_updated"],
                                              DISPLAY_DATE_FORMAT
                                            )
                                          : ""}
                                      </TableCell>
                                    </TableRow>
                                    {item["next_pecp_date"] && (
                                      <TableRow>
                                        <TableCell>Next PECP Date</TableCell>
                                        <TableCell>
                                          {dateUtils.formatDate(
                                            item["next_pecp_date"],
                                            DISPLAY_DATE_FORMAT
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    {item["next_pecp_title"] && (
                                      <TableRow>
                                        <TableCell>PECP Title</TableCell>
                                        <TableCell>
                                          {item["next_pecp_title"]}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    {item["next_pecp_short_description"] !==
                                      null && (
                                      <TableRow>
                                        <TableCell>PECP Description</TableCell>
                                        <TableCell>
                                          {item["next_pecp_short_description"]}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow>
                                      <TableCell>Additional Info</TableCell>
                                      <TableCell>
                                        {item["additional_info"]}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
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
