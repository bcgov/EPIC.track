import React from "react";
import { Alert, Button, FormLabel, Grid } from "@mui/material";
import { dateUtils } from "../../../../utils";
import TrackDatePicker from "../../../shared/DatePicker";

const ReportHeader = ({ ...props }) => {
  const STALE_DATE_BANNER =
    "Currently EPIC.track only contains EA Act (2018) data and can't produce reports dated before January 2020";
  return (
    <>
      <Grid
        component="form"
        onSubmit={(e) => e.preventDefault()}
        container
        spacing={2}
        sx={{ marginTop: "5px" }}
      >
        <Grid item sm={2}>
          <FormLabel>Report Date</FormLabel>
        </Grid>
        <Grid item sm={2}>
          <TrackDatePicker
            onChange={(dateVal: any) =>
              props.setReportDate(dateUtils.formatDate(dateVal.$d))
            }
            slotProps={{
              textField: {
                id: "ReportDate",
              },
            }}
          />
        </Grid>
        <Grid item sm={4}></Grid>
        <Grid item sm={2}>
          <Button
            variant="contained"
            type="submit"
            onClick={props.fetchReportData}
            sx={{ float: "right" }}
          >
            Submit
          </Button>
        </Grid>
        <Grid item sm={2}>
          <Button variant="contained" onClick={props.downloadPDFReport}>
            Download
          </Button>
        </Grid>
      </Grid>
      {props.showReportDateBanner && (
        <Alert severity="warning">{STALE_DATE_BANNER}</Alert>
      )}
    </>
  );
};

export default ReportHeader;
