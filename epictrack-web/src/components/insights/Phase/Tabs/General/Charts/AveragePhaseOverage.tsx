import { Grid, Box } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { BAR_COLOR } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { OptionType } from "components/shared/filterSelect/type";
import { showNotification } from "components/shared/notificationProvider";
import TrackSelect from "components/shared/TrackSelect";
import { useMemo, useState } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { useGetPhasesByAverageOverageQuery } from "services/rtkQuery/phaseInsights";

const AveragePhaseOverageChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { workPhases, loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const [selectedWorkType, setSelectedWorkType] = useState<OptionType | null>({
    value: "all",
    label: "All",
  });
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetPhasesByAverageOverageQuery(
    {
      columnFilters,
      selectedWorkType: String(selectedWorkType?.value) || "all",
      staffId: isUserInsights ? staffId : undefined,
    },
    { skip: columnFilters.length === 0 },
  );

  const workTypeOptions = useMemo(() => {
    if (!workPhases) return [];
    const workTypes = Array.from(
      new Map(
        workPhases.map((item) => [
          item.work.work_type_id,
          item.work.work_type.name,
        ]),
      ).entries(),
    );
    return workTypes.map(([id, name]) => ({
      id,
      name,
    }));
  }, [workPhases]);

  if (error) {
    showNotification(
      "Could not load WorkPhases by Average Phase Overage data",
      {
        duration: 3000,
        type: "error",
      },
    );
  }

  if (isChartLoading || loadingWorkPhases || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <ETCaption1 bold>AVERAGE PHASE OVERAGE</ETCaption1>
        </Grid>
        <Grid item xs={6} container justifyContent="flex-end">
          <Box sx={{ width: "200px" }}>
            <TrackSelect
              options={[
                { value: "all", label: "All" },
                ...workTypeOptions.map((workType) => ({
                  value: workType.id,
                  label: workType.name,
                })),
              ]}
              placeholder="Select Work Type"
              value={
                selectedWorkType
                  ? {
                      value: selectedWorkType.value,
                      label: selectedWorkType.label,
                    }
                  : { value: "all", label: "All" }
              }
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSelectedWorkType({
                  value: option.value,
                  label: option.label as string,
                });
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          container
          justifyContent={"center"}
          sx={{ flex: 1, minHeight: 350 }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 350,
              overflowY: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: 4,
            }}
          >
            {chartData.length > 0 && (
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ left: 80, bottom: 40 }}
                height={Math.max(chartData.length * 50 + 100, 350)}
                width={400}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  label={{
                    value: "Average Overage (days)",
                    position: "insideBottom",
                    offset: -5,
                    dy: 20,
                    style: { fontSize: 16 },
                  }}
                />
                <YAxis
                  dataKey="phase"
                  type="category"
                  width={40}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="average_overage"
                  fill={BAR_COLOR}
                  barSize={20}
                  name="Average Overage"
                />
              </BarChart>
            )}
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default AveragePhaseOverageChart;
