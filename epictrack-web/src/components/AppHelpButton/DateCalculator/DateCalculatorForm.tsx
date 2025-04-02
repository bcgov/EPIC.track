import { Button, Collapse, Grid, useTheme } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  ETCaption1,
  ETCaption3,
  ETDescription,
  ETFormLabel,
  ETHeading4,
} from "components/shared";
import { DATE_CALCULATION_TYPES } from "constants/application-constant";
import TrackSelect from "components/shared/TrackSelect";
import ControlledTextField from "components/shared/controlledInputComponents/ControlledTextField";
import { Palette } from "styles/theme";
import TrackDatePicker from "components/shared/DatePicker";
import { dateCalculator, isNonBCBusinessDay } from "./DateCalculator";
import { Case, If, Switch, Then } from "react-if";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";
import dayjs from "dayjs";

type DayCalculatorForm = {
  start_date: Date;
  end_date: Date;
  suspensionDate: Date;
  resumptionDate: Date;
  numOfDays: number;
};

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

export const DateCalculatorForm = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [suspensionDate, setSuspensionDate] = useState<Date | null>(null);
  const [resumptionDate, setResumptionDate] = useState<Date | null>(null);

  const [startDateWarning, setStartDateWarning] = useState<string>("");
  const [endDateWarning, setEndDateWarning] = useState<string>("");
  const [suspensionDateWarning, setSuspensionDateWarning] =
    useState<string>("");
  const [resumptionDateWarning, setResumptionDateWarning] =
    useState<string>("");

  const [selectedCalculationType, setSelectedCalculationType] =
    useState<string>(DATE_CALCULATION_TYPES[0].value);
  const [numOfDays, setNumOfDays] = useState<number | null>(null);
  const [expand, setExpand] = useState(false);
  const theme = useTheme();
  const methods = useForm<DayCalculatorForm>();

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
    setSuspensionDate(null);
    setResumptionDate(null);
    setSelectedCalculationType(DATE_CALCULATION_TYPES[0].value);
    setNumOfDays(null);
    setStartDateWarning("");
    setEndDateWarning("");
    setSuspensionDateWarning("");
    setResumptionDateWarning("");
  };

  const handleCalculate = () => {
    try {
      const res = dateCalculator(
        selectedCalculationType === "regular",
        selectedCalculationType === "suspended",
        numOfDays,
        startDate,
        endDate,
        suspensionDate,
        resumptionDate
      );
      if (res) {
        setStartDate(res.startDate);
        setEndDate(res.endDate);
        setNumOfDays(res.numDays);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <Grid container spacing={2} component={"form"}>
          <Grid item xs={12}>
            <ETHeading4>Enter any two fields to calculate the third</ETHeading4>
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Start Date</ETFormLabel>
            <TrackDatePicker
              name="start_date"
              value={dayjs(startDate).isValid() ? dayjs(startDate) : null}
              onChange={(e: any) => {
                setStartDate(e["$d"]);
                setStartDateWarning(isNonBCBusinessDay(e["$d"]));
              }}
            />
            <If condition={startDateWarning}>
              <Then>
                <ETCaption1 sx={{ color: "red" }}>
                  Warning: {startDateWarning} selected
                </ETCaption1>
              </Then>
            </If>
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>End Date</ETFormLabel>
            <TrackDatePicker
              name="end_date"
              value={dayjs(endDate).isValid() ? dayjs(endDate) : null}
              onChange={(e: any) => {
                setEndDate(e["$d"]);
                setEndDateWarning(isNonBCBusinessDay(e["$d"]));
              }}
            />
            <If condition={endDateWarning}>
              <Then>
                <ETCaption1 sx={{ color: "red" }}>
                  Warning: {endDateWarning} selected
                </ETCaption1>
              </Then>
            </If>
          </Grid>
          <If condition={selectedCalculationType === "suspended"}>
            <Then>
              <Grid item xs={6}>
                <ETFormLabel>Suspension Date</ETFormLabel>
                <TrackDatePicker
                  name="start_date"
                  value={
                    dayjs(suspensionDate).isValid()
                      ? dayjs(suspensionDate)
                      : null
                  }
                  onChange={(e: any) => {
                    setSuspensionDate(e["$d"]);
                    setSuspensionDateWarning(isNonBCBusinessDay(e["$d"]));
                  }}
                />
                <If condition={suspensionDateWarning}>
                  <Then>
                    <ETCaption1 sx={{ color: "red" }}>
                      Warning: {suspensionDateWarning} selected
                    </ETCaption1>
                  </Then>
                </If>
              </Grid>
              <Grid item xs={6}>
                <ETFormLabel>Resumption Date</ETFormLabel>
                <TrackDatePicker
                  name="end_date"
                  value={
                    dayjs(resumptionDate).isValid()
                      ? dayjs(resumptionDate)
                      : null
                  }
                  onChange={(e: any) => {
                    setResumptionDate(e["$d"]);
                    setResumptionDateWarning(isNonBCBusinessDay(e["$d"]));
                  }}
                />
                <If condition={resumptionDateWarning}>
                  <Then>
                    <ETCaption1 sx={{ color: "red" }}>
                      Warning: {resumptionDateWarning} selected
                    </ETCaption1>
                  </Then>
                </If>
              </Grid>
            </Then>
          </If>
          <Grid item xs={6}>
            <ETFormLabel>Calculation Type</ETFormLabel>
            <TrackSelect
              value={
                DATE_CALCULATION_TYPES.find(
                  (option) => option.value === selectedCalculationType
                ) || null
              }
              options={DATE_CALCULATION_TYPES}
              placeholder={"Select"}
              name={"Date Calculation Type"}
              onChange={(o: any) => setSelectedCalculationType(o?.value)}
              isClearable={false}
            />
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Number of Days</ETFormLabel>
            <ControlledTextField
              name="number_of_days"
              fullWidth
              value={numOfDays ? numOfDays : ""}
              InputProps={{
                inputProps: {
                  min: 0,
                },
              }}
              type="number"
              onChange={(e) => {
                const newNumberOfDays = Number(e?.target?.value);
                setNumOfDays(newNumberOfDays);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <ETFormLabel>Description</ETFormLabel>
            <Switch>
              <Case condition={selectedCalculationType === "regular"}>
                <ETDescription>
                  Start date is included in calculation.
                </ETDescription>
              </Case>
              <Case condition={selectedCalculationType === "suspended"}>
                <ETDescription>
                  Suspended dates are excluded from calculation.
                </ETDescription>
              </Case>
              <Case condition={selectedCalculationType === "dayZero"}>
                <Grid
                  item
                  xs={12}
                  container
                  justifyContent={"spac-between"}
                  alignItems={"center"}
                >
                  <Grid item xs={6}>
                    <ETDescription>
                      Start date is excluded from calculation.
                    </ETDescription>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="text"
                      startIcon={
                        <ExpandIcon
                          style={{
                            transform: !expand
                              ? "rotate(0deg)"
                              : "rotate(-180deg)",
                            transition: theme.transitions.create("transform", {
                              duration: theme.transitions.duration.shortest,
                            }),
                            fill: Palette.primary.accent.main,
                          }}
                        />
                      }
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => setExpand(!expand)}
                    >
                      {expand ? "Hide Day Zero rules." : "Show Day Zero rules."}
                    </Button>
                  </Grid>
                </Grid>
              </Case>
            </Switch>
          </Grid>
          <If condition={selectedCalculationType === "dayZero"}>
            <Then>
              <Grid item xs={12}>
                <Collapse in={expand}>
                  <ETHeading4>Holidays</ETHeading4>
                  <ul>
                    <li>
                      <ETCaption3>
                        If a deadline falls on a holiday the deadline is
                        extended to the next day that is not a holiday. For
                        example, if the deadline for a comment period is
                        December 26, boxing day, the deadline is extended to
                        December 27.
                      </ETCaption3>
                    </li>
                  </ul>
                  <ETHeading4>Weekends or Other Office Closures</ETHeading4>
                  <ul>
                    <li>
                      <ETCaption3>
                        If a deadline falls on a day when the office is not open
                        (Saturday, Sunday) the deadline is extended to the next
                        day that the office is open. For example, if the
                        deadline for a comment period falls on a Saturday then
                        the deadline is extended to Monday.
                      </ETCaption3>
                    </li>
                  </ul>
                  <ETHeading4>Calculation of Days</ETHeading4>
                  <ul>
                    <li>
                      <ETCaption3>
                        When calculating periods (for example 30 day comment
                        period) the first day must be excluded and the last day
                        included. For example, a 30 day comment period starts
                        March 1, 2017, the comment period does not end until
                        March 31, 2017.
                      </ETCaption3>
                    </li>
                    <li>
                      <ETCaption3>
                        Legislated time periods must be calculated with day -0-
                        eg, Evaluation 30 days, Application Review 180 days,
                        Ministers Decision 45 days, and Public Comment Periods.
                      </ETCaption3>
                    </li>
                  </ul>
                  <ETHeading4>Time of Day</ETHeading4>
                  <ul>
                    <li>
                      <ETCaption3>
                        There is no specific mention of time of day in the
                        Interpretation Act so the day would end at midnight. If
                        a comment is received before midnight on the last day of
                        the comment period it would be included in the comment
                        period. If an email was received at 11:59PM it would be
                        received in the comment period or if a written comment
                        was received at an open house before midnight then the
                        comment would also be included in the comment period.
                        Comments sent by mail or courier must be post marked by
                        the last day of the comment period in order to be
                        included in the comment period.
                      </ETCaption3>
                    </li>
                  </ul>
                  <ETHeading4>Suspension</ETHeading4>
                  <ul>
                    <li>
                      <ETCaption3>
                        Suspending a project during the Application Review
                        period, when the suspension resumes it starts back on
                        the day it was suspended on. If a project is suspended
                        on day 50 of the 180, in accordance with the spirit of
                        the Act, day 49 was the last full day of the Application
                        Review Period, when the project resumes, it would resume
                        on day 50 to allow 180 full days of review.
                      </ETCaption3>
                    </li>
                  </ul>
                  <ETHeading4>Interpretation Act</ETHeading4>
                  <ETCaption3>
                    <p>
                      <strong>25</strong>&nbsp;&nbsp;(1) This section applies to
                      an enactment and to a deed, conveyance or other legal
                      instrument unless specifically provided otherwise in the
                      deed, conveyance or other legal instrument.
                    </p>
                    <p>
                      (2) If the time for doing an act falls or expires on a
                      holiday, the time is extended to the next day that is not
                      a holiday.
                    </p>
                    <p>
                      (3) If the time for doing an act in a business office
                      falls or expires on a day when the office is not open
                      during regular business hours, the time is extended to the
                      next day that the office is open.
                    </p>
                    <p>
                      (4) In the calculation of time expressed as clear days,
                      weeks, months or years, or as &quot;at least&quot; or
                      &quot;not less than&quot; a number of days, weeks, months
                      or years, the first and last days must be excluded.
                    </p>
                    <p>
                      (5) In the calculation of time not referred to in
                      subsection (4), the first day must be excluded and the
                      last day included.
                    </p>
                    <p>
                      (6) If, under this section, the calculation of time ends
                      on a day in a month that has no date corresponding to the
                      first day of the period of time, the time ends on the last
                      day of that month.
                    </p>
                    <p>
                      (7) A specified time of day is a reference to Pacific
                      Standard time, or 8 hours behind Greenwich mean time,
                      unless Daylight Saving time is being used or observed on
                      that day.
                    </p>
                    <p>
                      (8) A person reaches a particular age expressed in years
                      at the start of the relevant anniversary of his or her
                      date of birth.
                    </p>
                  </ETCaption3>
                </Collapse>
              </Grid>
            </Then>
          </If>
        </Grid>
        <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
          <Grid item>
            <Button
              size="large"
              onClick={resetForm}
              variant="outlined"
              sx={{
                minWidth: "124px",
                "&:hover": {
                  backgroundColor: Palette.primary.main,
                  color: Palette.neutral.bg.light,
                },
              }}
            >
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button
              size="large"
              onClick={handleCalculate}
              variant="contained"
              sx={{
                minWidth: "124px",
                "&:focus": {
                  backgroundColor: Palette.primary.main,
                  color: Palette.neutral.bg.light,
                },
              }}
            >
              Calculate
            </Button>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};
