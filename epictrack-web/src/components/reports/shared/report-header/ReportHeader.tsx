import { useState } from "react";
import { Alert, Box, Button, FormLabel, Grid, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { dateUtils } from "../../../../utils";
import { ETFormLabel } from "components/shared";
import { CustomSwitch } from "components/shared/CustomSwitch";
import TrackDatePicker from "components/shared/DatePicker";

const ReportHeader = ({ ...props }) => {
  const [dateSelected, setDateSelected] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const STALE_DATE_BANNER =
    "Currently EPIC.track only contains EA Act (2018) data and can't produce reports dated before January 2020";

  const validateDate = (callback: () => void) => {
    if (!dateSelected) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    callback();
  };

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
            onChange={(dateVal: any) => {
              const formattedDate = dateUtils.formatDate(dateVal.$d);
              setDateSelected(Boolean(formattedDate));
              props.setReportDate(formattedDate);
              if (formattedDate) setShowAlert(false);
            }}
            slotProps={{
              textField: {
                id: "ReportDate",
              },
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <CustomSwitch
            checked={props.includeFirstPhase}
            name="include_first_phase"
            onChange={(e) => {
              const checked = e.target.checked;
              props.setIncludeFirstPhase(checked);
            }}
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
          />
          <ETFormLabel id="include_first_phase">Show Intake Phase</ETFormLabel>
          <Tooltip sx={{ paddingLeft: "2px" }} title="Show Works in Phase Zero">
            <Box
              component={"span"}
              sx={{
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <InfoIcon
                sx={{
                  fontSize: "16px",
                  color: "text.secondary",
                  marginLeft: "5px",
                }}
              />
            </Box>
          </Tooltip>
        </Grid>
        <Grid item sm={2}></Grid>
        <Grid item sm={2}>
          <Button
            variant="contained"
            type="submit"
            onClick={() => validateDate(props.fetchReportData)}
            sx={{ float: "right" }}
          >
            Submit
          </Button>
        </Grid>
        <Grid item sm={2}>
          <Button
            variant="contained"
            onClick={() => validateDate(props.downloadPDFReport)}
          >
            Download
          </Button>
        </Grid>
      </Grid>
      {props.showReportDateBanner && (
        <Alert severity="warning">{STALE_DATE_BANNER}</Alert>
      )}
      {showAlert && (
        <Alert
          aria-live="assertive"
          severity="error"
          sx={{ marginTop: "10px" }}
        >
          Please select a date before generating the report.
        </Alert>
      )}
    </>
  );
};

export default ReportHeader;
