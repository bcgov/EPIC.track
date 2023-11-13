import { Box, Grid } from "@mui/material";
import React from "react";
import { ETParagraph } from "../../shared";
import { CalendarEvent } from "../type";
import moment from "moment";

interface Props {
  event?: CalendarEvent;
}

const EventDetails: React.FC<Props> = ({ event }) => {
  return (
    <>
      {event && (
        <Grid container columnSpacing={1.5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Project</ETParagraph>
              <ETParagraph>{event?.project}</ETParagraph>
            </Box>
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Milestone</ETParagraph>
              <ETParagraph>{event?.name}</ETParagraph>
            </Box>
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Start Date</ETParagraph>
              <ETParagraph>
                {moment(event.start_date).format("MMM DD, YYYY")}
              </ETParagraph>
            </Box>
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>End Date</ETParagraph>
              <ETParagraph>
                {moment(event.end_date).format("MMM DD, YYYY")}
              </ETParagraph>
            </Box>

            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Description</ETParagraph>
              <ETParagraph>{event?.project_description}</ETParagraph>
            </Box>
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Address</ETParagraph>
              <ETParagraph>{event?.project_address}</ETParagraph>
            </Box>
            <Box
              sx={{
                display: "flex",
                "& > div": { flex: "0 20%" },
                "& > div:last-child": { flexGrow: 1 },
              }}
            >
              <ETParagraph bold>Phase</ETParagraph>
              <ETParagraph>{event?.phase}</ETParagraph>
            </Box>
          </Box>
          {/* <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              flexBasis: "50%",
            }}
          >
            <ETParagraph>{event?.name}</ETParagraph>
            <ETParagraph>
              {moment(event.start_date).format("MMM DD, YYYY")}
            </ETParagraph>
            <ETParagraph>
              {moment(event.end_date).format("MMM DD, YYYY")}
            </ETParagraph>
            <ETParagraph>{event?.project}</ETParagraph>
            <ETParagraph>{event?.project_description}</ETParagraph>
            <ETParagraph>{event?.project_address}</ETParagraph>
            <ETParagraph>{event?.phase}</ETParagraph>
          </Box> */}
        </Grid>
      )}
    </>
  );
};

export default EventDetails;
