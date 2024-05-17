import { TrackTooltip } from "components/common/TrackTooltip";
import { TaskBarTooltipProps } from "components/gantt";
import { ETCaption2 } from "components/shared";
import { Palette } from "styles/theme";

const WorkplanGanttTooltip = ({ task, children }: TaskBarTooltipProps) => {
  return (
    <TrackTooltip
      followCursor
      body={
        <div
          style={{
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: "1em",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: Palette.neutral.bg.light,
                padding: "16px",
              }}
            >
              <ETCaption2 bold>{task.rowName}</ETCaption2>
            </div>
            <div
              style={{
                padding: "8px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "1em",
              }}
            >
              <ETCaption2
                sx={{
                  flex: 1,
                  width: "100%",
                }}
                bold
              >
                {task.name}
              </ETCaption2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    gap: 4,
                  }}
                >
                  <ETCaption2 sx={{ width: "50%" }}>Phase Start:</ETCaption2>
                  <ETCaption2>{task.start.toDateString()}</ETCaption2>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    gap: 4,
                  }}
                >
                  <ETCaption2 sx={{ width: "50%" }}>Phase End:</ETCaption2>
                  <ETCaption2>{task.end.toDateString()}</ETCaption2>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </TrackTooltip>
  );
};

export default WorkplanGanttTooltip;
