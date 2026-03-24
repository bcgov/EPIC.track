import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { When } from "react-if";
import { Box, Button, Grid, IconButton, SxProps, Tooltip } from "@mui/material";
import Moment from "moment";
import { ETCaption1, ETParagraph } from "components/shared";
import { Restricted } from "components/shared/restricted";
import { showNotification } from "components/shared/notificationProvider";
import BorderLinearProgress from "components/shared/progress/Progress";
import ETAccordion from "components/shared/accordion/Accordion";
import ETAccordionDetails from "components/shared/accordion/components/AccordionDetails";
import ETAccordionSummary from "components/shared/accordion/components/AccordionSummary";
import TrackDialog from "components/shared/TrackDialog";
import EventGrid from "../event";
import { WorkplanContext } from "../WorkPlanContext";
import Icons from "../../icons/index";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";
import { MONTH_DAY_YEAR, ROLES } from "constants/application-constant";
import { PhaseAccordionProps } from "./type";
import phaseOverageResponsibilityService from "services/phaseOverageResponsibilityService";
import { workService } from "services/workService/workService";
import {
  OverageResponsibilityEnum,
  OverageResponsibilityLookup,
  PhaseOverageResponsibility,
} from "models/phaseOverageResponsibilities";
import { WorkTypeEnum } from "models/workType";
import OverageResponsibilityForm from "./overageResponsibility/OverageResponsibilityForm";
import { useIsActiveTeamMember } from "../utils";
import WarningBox from "components/shared/warningBox";

const GoToIcon: FC<IconProps> = Icons["GoToIcon"];
const ExpandIcon: FC<IconProps> = Icons["ExpandIcon"];
const PauseIcon: FC<IconProps> = Icons["PauseIcon"];
const IndicatorIcon: FC<IconProps> = Icons["IndicatorIcon"];
const EditIcon: FC<IconProps> = Icons["PencilEditIcon"];

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
  children?: ReactNode;
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

const PhaseAccordion = ({
  phase,
  expanded,
  onExpandHandler,
  showAnticipated,
  showActual,
  isCurrentPhase,
}: PhaseAccordionProps) => {
  const [overageResponsibilities, setOverageResponsibilities] = useState<
    PhaseOverageResponsibility[]
  >([]);
  const [open, setOpen] = useState<boolean>(false);
  const { getWorkPhases, selectedWorkPhase, setSelectedWorkPhase, work } =
    useContext(WorkplanContext);

  const isActiveTeamMember = useIsActiveTeamMember();
  const isCompleted = phase.work_phase.is_completed;
  const isLegislated = phase.work_phase.legislated;
  const isOverageResponsibilityRequired =
    isLegislated || work?.work_type_id === WorkTypeEnum.AMENDMENT;
  const responsibilitiesText = overageResponsibilities
    ?.map((r) => r.responsibility)
    .join(", ");
  const progressText = isCompleted
    ? `${isLegislated ? "Legislated " : ""}Phase Completed`
    : `Upcoming ${isLegislated ? "Legislated " : ""}Phase`;
  const daysAhead = phase.total_number_of_days - phase.days_taken;
  const hasOverage = daysAhead < 0;
  const isNextEventEndEvent = phase.next_milestone === phase.end_milestone.name;

  const isSelectedPhase = useMemo<boolean>(
    () => phase.work_phase.id === selectedWorkPhase?.work_phase.id,
    [phase, selectedWorkPhase],
  );

  useEffect(() => {
    if (expanded) {
      setSelectedWorkPhase(phase);
    }
  }, [expanded, phase, setSelectedWorkPhase]);

  const daysTakenText = useMemo(() => {
    if (isCompleted) {
      if (daysAhead > 0)
        return `(${Math.abs(daysAhead)} day${daysAhead !== 1 ? "s" : ""} early)`;
      if (daysAhead < 0)
        return `(${Math.abs(daysAhead)} day${daysAhead !== 1 ? "s" : ""} over)`;
    } else {
      if (daysAhead < 0)
        return `(${Math.abs(daysAhead)} day${daysAhead !== 1 ? "s" : ""} over)`;
    }
    return "";
  }, [daysAhead, isCompleted]);

  const getPhaseOverageResponsibilities = useCallback(async () => {
    try {
      const overageResponsibilityData =
        await phaseOverageResponsibilityService.getAllByPhaseId(
          phase.work_phase.id.toString(),
        );
      setOverageResponsibilities(overageResponsibilityData.data);
    } catch (error) {
      showNotification("Could not load phase overage responsibilities.", {
        duration: 3000,
        type: "error",
      });
    }
  }, [phase.work_phase.id]);

  useEffect(() => {
    if (phase.milestone_progress !== 0 || isCurrentPhase) {
      getPhaseOverageResponsibilities();
    }
  }, [
    getPhaseOverageResponsibilities,
    isCurrentPhase,
    phase.milestone_progress,
  ]);

  const getPhaseOverdueColour = (
    isOverageResponsibilityRequired: boolean,
    isCompleted: boolean,
  ) => {
    if (!isOverageResponsibilityRequired) return Palette.neutral.dark;
    if (daysAhead > 0 && isCompleted) return Palette.success.dark;
    if (daysAhead < 0) return Palette.error.dark;
    else return Palette.neutral.dark;
  };

  const handleSaveOverageResponsibility = async (
    data: any,
    onSuccess: () => void,
  ) => {
    try {
      if (!selectedWorkPhase) return;
      // 1. Patch notes on the phase
      await workService.savePhaseResponsibilityNotes(
        selectedWorkPhase.work_phase.id,
        data.notes,
      );
      const existingRes: PhaseOverageResponsibility[] =
        overageResponsibilities || [];
      const next: OverageResponsibilityEnum[] = data.responsibility || [];
      const existingValues = existingRes.map((er) => er.responsibility);
      const toAdd = next.filter((r) => !existingValues.includes(r));
      const toRemove = existingRes.filter(
        (er) => !next.includes(er.responsibility),
      );
      // 2. Add new responsibilities
      for (const r of toAdd) {
        await phaseOverageResponsibilityService.create({
          work_phase_id: selectedWorkPhase.work_phase.id,
          responsibility: OverageResponsibilityLookup[r],
          work_id: work?.id,
        });
      }
      // 3. Remove responsibilities
      for (const er of toRemove) {
        await phaseOverageResponsibilityService.delete(String(er.id), {
          work_id: work?.id,
        });
      }
      onSuccess();
      getWorkPhases();
      getPhaseOverageResponsibilities();
      setOpen(false);
    } catch (e) {
      showNotification(`Could not save Overage Responsibility. Error: ${e}.`, {
        duration: 3000,
        type: "error",
      });
      console.error(e);
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
          onChange={(_, expanded) => onExpandHandler(expanded)}
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
              <Grid item xs={2.8}>
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
              <Grid item xs={1}>
                <SummaryItem
                  title="Start date"
                  content={Moment(phase.work_phase.start_date).format(
                    MONTH_DAY_YEAR,
                  )}
                  isTitleBold={isSelectedPhase}
                />
              </Grid>
              {showAnticipated && (
                <Grid item xs={1.2}>
                  <SummaryItem
                    title="Anticipated End"
                    content={Moment(
                      phase.end_milestone?.anticipated_date,
                    ).format(MONTH_DAY_YEAR)}
                    isTitleBold={isSelectedPhase}
                  />
                </Grid>
              )}
              {showActual && (
                <Grid item xs={1}>
                  <SummaryItem
                    title="Actual End"
                    content={Moment(phase.end_milestone?.actual_date).format(
                      MONTH_DAY_YEAR,
                    )}
                    isTitleBold={isSelectedPhase}
                  />
                </Grid>
              )}
              <Grid item xs={showActual ? 1.4 : 1.2}>
                <SummaryItem
                  title={"Days"}
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
                            isOverageResponsibilityRequired,
                            isCompleted,
                          ),
                        }}
                      >
                        <>
                          {phase.days_taken} / {phase.total_number_of_days}
                          {isOverageResponsibilityRequired && (
                            <> {daysTakenText}</>
                          )}
                        </>
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

              {hasOverage && (
                <Grid item xs={1.6}>
                  <Box
                    sx={{
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
                      Overage Responsibility
                      {hasOverage && isOverageResponsibilityRequired && (
                        <span style={{ color: "red", marginLeft: "2px" }}>
                          *
                        </span>
                      )}
                    </ETCaption1>
                    {overageResponsibilities?.length > 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Tooltip
                          title={responsibilitiesText}
                          sx={{ width: "100%" }}
                        >
                          <ETParagraph
                            bold={isSelectedPhase}
                            sx={{
                              ...summaryContentStyle,
                              display: "-webkit-box",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {responsibilitiesText}
                          </ETParagraph>
                        </Tooltip>
                        <Restricted
                          allowed={[ROLES.EXTENDED_EDIT]}
                          errorProps={{ disabled: true }}
                          exception={isActiveTeamMember}
                        >
                          <IconButton
                            color="primary"
                            onClick={(event) => {
                              setSelectedWorkPhase(phase);
                              setOpen(true);
                              event?.stopPropagation();
                            }}
                            sx={{
                              padding: 0.275,
                              color: "primary.main",
                              "&:disabled": {
                                color: Palette.neutral.main,
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Restricted>
                      </Box>
                    ) : (
                      <Restricted
                        allowed={[ROLES.EXTENDED_EDIT]}
                        errorProps={{ disabled: true }}
                        exception={isActiveTeamMember}
                      >
                        <Button
                          variant="text"
                          endIcon={<GoToIcon />}
                          sx={{
                            backgroundColor: "inherit",
                            borderColor: "transparent",
                            color: "primary.main",
                            "&:disabled": {
                              color: Palette.neutral.main,
                            },
                            height: "fit-content",
                            justifyContent: "flex-start",
                            minWidth: "auto",
                            padding: 0,
                            textAlign: "start",
                            width: "fit-content",
                          }}
                          onClick={(event) => {
                            setSelectedWorkPhase(phase);
                            setOpen(true);
                            event?.stopPropagation();
                          }}
                        >
                          select option(s)
                        </Button>
                      </Restricted>
                    )}
                  </Box>
                </Grid>
              )}
              {!hasOverage && <Grid item xs={1.6}></Grid>}
              {!showActual && isCurrentPhase && <Grid item xs={0.7}></Grid>}
              {!showActual && !isCurrentPhase && <Grid item xs={1.3}></Grid>}
              {!showAnticipated && <Grid item xs={1.3}></Grid>}
              {isCurrentPhase && (
                <>
                  <Grid item xs={1.7}>
                    <SummaryItem
                      title="Next milestone"
                      enableTooltip={true}
                      content={phase.next_milestone}
                      isTitleBold={isSelectedPhase}
                    />
                  </Grid>
                  <Grid item xs={1.8}>
                    <SummaryItem title="Progress">
                      <BorderLinearProgress
                        variant="determinate"
                        value={phase.milestone_progress}
                        sx={{ marginTop: "10px" }}
                      />
                    </SummaryItem>
                  </Grid>
                </>
              )}
              {!isCurrentPhase && (
                <>
                  <Grid item xs={1.1}></Grid>
                  <Grid item xs={1.8}>
                    <SummaryItem title="Progress">
                      <ETParagraph
                        bold={isSelectedPhase}
                        sx={{
                          ...summaryContentStyle,
                        }}
                      >
                        {progressText}
                      </ETParagraph>
                    </SummaryItem>
                  </Grid>
                </>
              )}
            </Grid>
          </ETAccordionSummary>
          <ETAccordionDetails
            sx={{
              pt: "24px",
            }}
          >
            {expanded && <EventGrid />}
            {hasOverage &&
              isOverageResponsibilityRequired &&
              overageResponsibilities?.length <= 0 &&
              isNextEventEndEvent && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    padding: "0",
                  }}
                >
                  <WarningBox
                    title={`You've exceeded the ${isLegislated ? "legislated" : ""} timeline in ${phase.work_phase.name}.`}
                    subTitle={
                      <>
                        You must add an <b>Overage Responsibility</b> before you
                        can to complete this phase.
                      </>
                    }
                    isTitleBold={true}
                  />
                </Box>
              )}
          </ETAccordionDetails>
        </ETAccordion>
      </Box>
      <TrackDialog
        dialogTitle="Overage Responsibility"
        disableEscapeKeyDown
        formId="overage-responsibility-form"
        fullWidth
        subHeading={phase.work_phase.name}
        isActionsRequired
        maxWidth="sm"
        okButtonText="Save"
        onCancel={() => setOpen(false)}
        open={open}
      >
        <OverageResponsibilityForm
          onSave={handleSaveOverageResponsibility}
          daysTakenText={daysTakenText}
          overageResponsibilities={overageResponsibilities ?? []}
          daysAhead={daysAhead}
          isRequired={isOverageResponsibilityRequired}
          hasOverage={hasOverage}
        />
      </TrackDialog>
    </>
  );
};

export default PhaseAccordion;
