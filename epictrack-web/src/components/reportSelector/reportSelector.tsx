import React, { useState } from "react";
import { FormLabel, Grid, MenuItem } from "@mui/material";
import {
  REPORT_TYPES,
  REPORT_TYPE,
} from "../../constants/application-constant";
import Select from "@mui/material/Select";
import AnticipatedEAOSchedule from "../reports/eaReferral/AnticipatedEAOSchedule";
import ResourceForecast from "../reports/resourceForecast/ResourceForecast";
import ThirtySixtyNinety from "../reports/30-60-90Report/ThirtySixtyNinety";
import { ETPageContainer } from "../shared";
import EventCalendar from "../eventCalendar/EventCalendar";

export default function ReportSelector() {
  const [selectedReport, setSelectedReport] = useState<string>("none");
  const reportTypeOptions = REPORT_TYPES.map((p, index) => (
    <MenuItem key={index + 1} value={p.Value}>
      {p.Text}
    </MenuItem>
  ));
  return (
    <>
      <ETPageContainer
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item sm={2}>
          <FormLabel>Report</FormLabel>
        </Grid>
        <Grid item sm={5}>
          <Select
            value={selectedReport}
            onChange={(e: any) => setSelectedReport(e.target.value)}
          >
            <MenuItem key={0} value="none">
              Select Report
            </MenuItem>
            {reportTypeOptions}
          </Select>
        </Grid>
        <Grid item sm={12}>
          {selectedReport === REPORT_TYPE.EA_REFERRAL && (
            <AnticipatedEAOSchedule />
          )}
          {selectedReport === REPORT_TYPE.RESOURCE_FORECAST && (
            <ResourceForecast />
          )}
          {selectedReport === REPORT_TYPE.REPORT_30_60_90 && (
            <ThirtySixtyNinety />
          )}
          {selectedReport === REPORT_TYPE.EVENT_CALENDAR && <EventCalendar />}
        </Grid>
      </ETPageContainer>
    </>
  );
}
