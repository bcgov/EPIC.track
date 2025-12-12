import { Grid, Tooltip as MuiTooltip } from "@mui/material";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { getChartColor } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { ResponsibilityByWorktypePhase } from "models/insights";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useGetOverageResponsibilityQuery } from "services/rtkQuery/phaseInsights";

const OverageResponsibilityChart = () => {
  const { viewUnderage: isUnderageToggled } = usePhaseInsightsContext();
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetOverageResponsibilityQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
      isUnderageToggled,
    },
    { skip: columnFilters.length === 0 || isUnderageToggled },
  );

  if (error) {
    showNotification("Could not load phase overage responsibility data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || loadingWorkPhases || !data) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data?: ResponsibilityByWorktypePhase[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.responsibility_name,
        value: item.count,
        id: item.responsibility_id,
      };
    });
  };

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiTooltip title="Includes Legislated Phases plus Amendment Phases">
            <span>
              <ETCaption1 bold>OVERAGE RESPONSIBILITY</ETCaption1>
            </span>
          </MuiTooltip>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          {!isUnderageToggled && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart width={400} height={350}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={getChartColor(index)}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconSize={16}
                  wrapperStyle={{
                    fontSize: "16px",
                  }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default OverageResponsibilityChart;
