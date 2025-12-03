import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, Grid } from "@mui/material";
import { When } from "react-if";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { useCachedState } from "hooks/useCachedFilters";
import { CustomSwitch } from "components/shared/CustomSwitch";
import { ETCaption1, ETHeading4 } from "components/shared";
import { IconProps } from "components/icons/type";
import { OptionType } from "components/shared/filterSelect/type";
import Icons from "components/icons";
import TrackSelect from "components/shared/TrackSelect";
import WarningBox from "components/shared/warningBox";
import { Palette } from "../../../styles/theme";
import { WorkplanContext } from "../WorkPlanContext";
import PhaseAccordion from "./PhaseAccordion";
import { usePhaseTimeline } from "hooks/usePhaseTimeline";
import { REPORT_ISSUE_LINKS } from "constants/application-constant";

const CalendarIcon: FC<IconProps> = Icons["CalendarIcon"];

const dateStyleOptions = [
  { value: "ACTUAL", label: "Actual" },
  { value: "ACTUAL_AND_ANTICIPATED", label: "Actual + Anticipated" },
];

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);
  const WORKPLAN_EXPANDED_PHASE_CACHE_KEY = `workplan-work-id-${ctx.work?.id}-expanded-phase`;
  const [cachedExpandedPhase, setCachedExpandedPhase] = useCachedState<
    number | null
  >(
    WORKPLAN_EXPANDED_PHASE_CACHE_KEY,
    ctx.selectedWorkPhase?.work_phase.id ?? null,
  );
  const [showCompletedPhases, setShowCompletedPhases] = useState<boolean>(true);
  const [showCompletedActual, setShowCompletedActual] = useState<boolean>(true);
  const [showCompletedAnticipated, setShowCompletedAnticipated] =
    useState<boolean>(false);

  const {
    currentAndFuturePhases,
    completedPhases,
    overduePhases,
    numberOfExtensionDaysRecommended,
    isDecisionComplete,
  } = usePhaseTimeline({
    workPhases: ctx.workPhases,
    currentWorkPhaseId: ctx.work?.current_work_phase_id,
  });

  const handleExpand = (phaseId: number) => {
    setCachedExpandedPhase(cachedExpandedPhase === phaseId ? null : phaseId);
  };

  useEffect(() => {
    if (
      !cachedExpandedPhase &&
      ctx.work?.current_work_phase_id &&
      ctx.workPhases.length > 0 &&
      !ctx.selectedWorkPhase
    ) {
      const phase = ctx.workPhases.find(
        (workPhase) =>
          workPhase.work_phase.id === ctx.work?.current_work_phase_id,
      );
      ctx.setSelectedWorkPhase(phase);
      setCachedExpandedPhase(phase?.work_phase.id ?? null);
    }
  }, [cachedExpandedPhase, ctx, setCachedExpandedPhase]);

  useEffect(() => {
    if (ctx.selectedWorkPhase) {
      setCachedExpandedPhase(ctx.selectedWorkPhase.work_phase.id);
    }
  }, [ctx.selectedWorkPhase, setCachedExpandedPhase]);

  const callback = useCallback(() => {
    return ctx.work?.work_type?.name ?? undefined;
  }, [ctx.work?.work_type?.name]);

  useRouterLocationStateForHelpPage(callback);

  const formatDateStyleOptionLabel = (
    option: any,
    { context }: { context: "menu" | "value" },
  ) => {
    return (
      <ETCaption1
        sx={{ textTransform: "uppercase" }}
        color={Palette.neutral.dark}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {context === "value" && <CalendarIcon />}
          {context === "value"
            ? `Phase Date View: ${option.label}`
            : option.label}
        </Box>
      </ETCaption1>
    );
  };

  if (ctx.workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      <When condition={completedPhases.length > 0}>
        <Grid item xs={12}>
          <FormControlLabel
            sx={{
              ml: "2px",
            }}
            control={
              <CustomSwitch
                onChange={(e, checked) => setShowCompletedPhases(checked)}
                sx={{
                  marginRight: "8px",
                  color: Palette.neutral.dark,
                }}
                defaultChecked={showCompletedPhases}
              />
            }
            label={
              <ETCaption1
                sx={{
                  color: Palette.neutral.dark,
                }}
              >
                COMPLETED PHASES
              </ETCaption1>
            }
          />
          <></>
          {showCompletedPhases && (
            <FormControl sx={{ minWidth: 220 }}>
              <TrackSelect
                options={dateStyleOptions}
                value={
                  showCompletedAnticipated
                    ? dateStyleOptions.find(
                      (option) => option.value === "ACTUAL_AND_ANTICIPATED",
                    )
                    : dateStyleOptions[0]
                }
                onChange={(selectedOption) => {
                  const option = selectedOption as OptionType;
                  if (option.value === "ACTUAL") {
                    setShowCompletedActual(true);
                    setShowCompletedAnticipated(false);
                  } else {
                    setShowCompletedActual(true);
                    setShowCompletedAnticipated(true);
                  }
                }}
                isClearable={false}
                isSearchable={false}
                formatOptionLabel={formatDateStyleOptionLabel}
              />
            </FormControl>
          )}
        </Grid>
      </When>
      <When condition={showCompletedPhases}>
        {completedPhases.map((phase) => (
          <Grid item xs={12} key={`completed-phase-${phase.work_phase.id}`}>
            <PhaseAccordion
              key={`phase-accordion-${phase.work_phase.id}`}
              expanded={cachedExpandedPhase === phase.work_phase.id}
              onExpandHandler={() => handleExpand(phase.work_phase.id)}
              phase={phase}
              showAnticipated={showCompletedAnticipated}
              showActual={showCompletedActual}
            />
          </Grid>
        ))}
      </When>
      <When condition={currentAndFuturePhases.length > 0}>
        <Grid item xs={12}>
          <ETCaption1
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            CURRENT + FUTURE PHASES
          </ETCaption1>
        </Grid>
      </When>
      {currentAndFuturePhases.map((phase) => (
        <Grid item xs={12} key={`current-phase-${phase.work_phase.id}`}>
          <PhaseAccordion
            key={`phase-accordion-${phase.work_phase.id}`}
            expanded={cachedExpandedPhase === phase.work_phase.id}
            onExpandHandler={() => handleExpand(phase.work_phase.id)}
            phase={phase}
            showAnticipated={true}
            showActual={false}
            isCurrentPhase={
              ctx.work?.current_work_phase_id === phase.work_phase.id
            }
          />
        </Grid>
      ))}
      {numberOfExtensionDaysRecommended > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            padding: "1rem",
          }}
        >
          {!isDecisionComplete ? (
            <WarningBox
              title={`You've exceeded the legislated timeline in phase${overduePhases.length > 1 ? "s" : ""
                }: ${overduePhases.map((p) => p.work_phase.name).join(", ")}.`}
              subTitle={
                <>
                  You must add an <b>Extension Milestone</b> of{" "}
                  <b>{numberOfExtensionDaysRecommended} days</b> to complete this
                  Work.
                </>
              }
              isTitleBold={true}
            />
          ) : (
            <WarningBox
              title="Date Miscalculation"
              subTitle={
                <>
                  This Work was completed with a date miscalculation. Please {" "}
                  <a href={REPORT_ISSUE_LINKS.JSM_PORTAL} target="_blank" rel="noopener noreferrer">
                    submit a Data Fix request
                  </a>{" "} to rectify this alert.
                </>
              }
              isTitleBold={true}
            />)}
        </Box>
      )}
    </Grid>
  );
};

export default PhaseContainer;
