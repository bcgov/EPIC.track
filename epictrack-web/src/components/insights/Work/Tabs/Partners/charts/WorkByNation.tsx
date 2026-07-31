import { Grid, Box } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BAR_COLOR } from "components/insights/utils";
import { Palette } from "styles/theme";
import { WorkByNation } from "models/insights";
import { useGetWorksByNationQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const AXIS_WIDTH = 180;
const TICK_FONT_SIZE = 12;
const MAX_TICK_CHARS = Math.floor(AXIS_WIDTH / (TICK_FONT_SIZE * 0.55));
const NationTick = ({ x, y, payload }: any) => {
  const name: string = payload?.value ?? "";
  const label =
    name.length > MAX_TICK_CHARS
      ? `${name.slice(0, MAX_TICK_CHARS - 1).trimEnd()}…`
      : name;

  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={TICK_FONT_SIZE}
      fill={Palette.neutral.dark}
    >
      <title>{name}</title>
      {label}
    </text>
  );
};

const WorkByNationChart = () => {
  const { isUserInsights, staffId } = useInsightsContext();

  const { columnFilters } = useTableFilterContext();
  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByNationQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
    },
    { skip: columnFilters.length === 0 },
  );

  const formatData = (data?: WorkByNation[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        nation: item.first_nation,
        count: item.count,
      };
    });
  };

  if (error) {
    showNotification("Could not load Work by Nation data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || error) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1} sx={{ height: "100%" }}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY NATION</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The number of active Works a Nation is associated with
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <Box style={{ width: "100%", height: "300px", overflowY: "auto" }}>
            {chartData.length > 0 && (
              <ResponsiveContainer
                width="100%"
                height={chartData.length * 30 + 100}
              >
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ left: 10, top: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="nation"
                    interval={0}
                    tick={<NationTick />}
                    type="category"
                    width={AXIS_WIDTH}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={BAR_COLOR} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByNationChart;
