import { Box, Grid, SxProps, Tooltip } from "@mui/material";
import React, { useContext } from "react";
import Moment from "moment";
import ETAccordion from "../../shared/accordion/Accordion";
import { PhaseAccordionProps } from "./type";
import ETAccordionSummary from "../../shared/accordion/components/AccordionSummary";
import { ETCaption1, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import ETAccordionDetails from "../../shared/accordion/components/AccordionDetails";
import EventGrid from "../event";
import { WorkplanContext } from "../WorkPlanContext";
import BorderLinearProgress from "../../shared/progress/Progress";
import Icons from "../../icons/index";
import { IconProps } from "../../icons/type";
import { When } from "react-if";
import { MONTH_DAY_YEAR } from "../../../constants/application-constant";
const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];
const PauseIcon: React.FC<IconProps> = Icons["PauseIcon"];
const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];

const summaryContentStyle: SxProps = {
  minHeight: "1.5rem",
  color: `${Palette.neutral.dark}`,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
};
interface SummaryItemProps {
  isTitleBold?: boolean;
  title: string;
  content?: string;
  maxLength?: number;
  children?: React.ReactNode;
  enableTooltip?: boolean;
  sx?: SxProps;
}
const SummaryItem = (props: SummaryItemProps) => {
  return (
    <Box
      sx={{
        ...props.sx,
        display: "flex",
        gap: "0.5rem",
        flexDirection: "column",
        minHeight: "48px",
      }}
    >
      <ETCaption1
        sx={{
          textTransform: "uppercase",
          color: `${Palette.neutral.main}`,
          letterSpacing: "0.39px !important",
        }}
      >
        {props.title}
      </ETCaption1>
      {props.children && props.children}
      {props.content && (
        <Tooltip
          title={props.content}
          disableHoverListener={!props.enableTooltip}
        >
          <ETParagraph
            bold={props.isTitleBold}
            enableEllipsis={true}
            sx={{
              ...summaryContentStyle,
              color: `${Palette.neutral.dark}`,
            }}
          >
            {props.content}
          </ETParagraph>
        </Tooltip>
      )}
    </Box>
  );
};

const PhaseAccordion = ({ phase, ...rest }: PhaseAccordionProps) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const { selectedWorkPhase, setSelectedWorkPhase } =
    useContext(WorkplanContext);
  const isSelectedPhase = React.useMemo<boolean>(
    () => phase.work_phase.id === selectedWorkPhase?.work_phase.id,
    [selectedWorkPhase]
  );
  React.useEffect(
    () => setExpanded(phase.work_phase.id === selectedWorkPhase?.work_phase.id),
    [phase, selectedWorkPhase]
  );
  const onExpandHandler = (expand: boolean) => {
    setExpanded(expand);
    setSelectedWorkPhase(phase);
  };
  const fromDate = React.useMemo(
    () =>
      Moment(phase.work_phase.start_date).isSameOrAfter(Moment())
        ? Moment(phase.work_phase.start_date)
        : Moment(),
    [phase]
  );

  const getPhaseOverdueColour = (daysLeft: number, isLegislated: boolean) => {
    if (daysLeft >= 0) return Palette.neutral.dark;
    if (isLegislated) {
      return Palette.error.dark;
    } else {
      return Palette.purple;
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          mb: "16px",
        }}
      >
        <ETAccordion
          expanded={expanded}
          onChange={(e, expanded) => onExpandHandler(expanded)}
        >
          <ETAccordionSummary
            expanded={expanded}
            expandIcon={<ExpandIcon fill={`${Palette.primary.main}`} />}
          >
            <Grid
              container
              columnSpacing={3}
              sx={{
                pt: "1rem",
                pb: "1rem",
              }}
            >
              <Grid item xs={3}>
                <SummaryItem
                  title="Phase"
                  content={phase.work_phase.name}
                  enableTooltip={true}
                  isTitleBold={isSelectedPhase}
                  sx={{
                    ml: "12px",
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <SummaryItem
                  title="Start date"
                  content={Moment(phase.work_phase.start_date).format(
                    MONTH_DAY_YEAR
                  )}
                  isTitleBold={isSelectedPhase}
                />
              </Grid>
              <Grid item xs={2}>
                <SummaryItem
                  title={
                    phase.work_phase.is_completed
                      ? "Total"
                      : "Days left / Total"
                  }
                  children={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <ETParagraph
                        bold={isSelectedPhase}
                        sx={{
                          ...summaryContentStyle,
                          color: getPhaseOverdueColour(
                            phase.days_left,
                            phase.work_phase.legislated
                          ),
                        }}
                      >
                        {phase.work_phase.is_completed && (
                          <>{phase.days_left < 0 ? 0 : phase.days_left}</>
                        )}
                        {!phase.work_phase.is_completed && (
                          <>
                            {phase.days_left < 0 ? 0 : phase.days_left} /{" "}
                            {phase.total_number_of_days.toString()}
                            {phase.days_left < 0
                              ? ` (${Math.abs(phase.days_left)} over)`
                              : ""}
                          </>
                        )}
                      </ETParagraph>
                      <When condition={phase.days_left < 0}>
                        <Box
                          sx={{
                            ml: "4px",
                          }}
                        >
                          <IndicatorIcon />
                        </Box>
                      </When>
                      <When condition={phase.work_phase.is_suspended}>
                        <Box
                          sx={{
                            ml: "4px",
                          }}
                        >
                          <PauseIcon />
                        </Box>
                      </When>
                    </Box>
                  }
                  isTitleBold={isSelectedPhase}
                />
              </Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={2}>
                <SummaryItem
                  title="Next milestone"
                  enableTooltip={true}
                  content={phase.next_milestone}
                  isTitleBold={isSelectedPhase}
                />
              </Grid>
              <Grid item xs={2}>
                <SummaryItem title="Milestone progress">
                  <BorderLinearProgress
                    variant="determinate"
                    value={phase.milestone_progress}
                    sx={{ marginTop: "10px" }}
                  />
                </SummaryItem>
              </Grid>
            </Grid>
          </ETAccordionSummary>
          <ETAccordionDetails
            expanded={expanded}
            sx={{
              pt: "24px",
            }}
          >
            <EventGrid />
          </ETAccordionDetails>
        </ETAccordion>
      </Box>
    </>
  );
};

export default PhaseAccordion;
