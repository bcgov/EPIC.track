import React from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { ETCaption1, ETPreviewBox, ETPreviewText } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";
import { Status } from "../../../../../models/status";

interface StatusPreview {
  statusForPreview: Status;
}

const ApprovedStatus = ({ statusForPreview }: StatusPreview) => {
  return (
    <>
      <Box sx={{ display: "flex", gap: "8px", paddingBottom: "8px" }}>
        <ETCaption1 bold>Status</ETCaption1>
        <ETCaption1 bold sx={{ letterSpacing: "0.39px" }}>
          ({moment(statusForPreview?.posted_date).format("ll")})
        </ETCaption1>
      </Box>
      <ETPreviewBox>
        <ETPreviewText
          color={Palette.neutral.dark}
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {statusForPreview?.description}
        </ETPreviewText>
      </ETPreviewBox>
    </>
  );
};

export default ApprovedStatus;
