import React from "react";
import icons from "../../../../icons";
import { Stack } from "@mui/material";
import { ETCaption2, ETCaption3 } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";

export const EmptyIssueHistory = () => {
  const IssueHistoryIcon = icons["TimelineIcon"];

  return (
    <Stack
      data-cy="empty-issue-history"
      justifyContent={"center"}
      alignItems={"center"}
      sx={{ height: "100%" }}
      spacing={1}
    >
      <span style={{ marginBottom: "0.5em" }}>
        <IssueHistoryIcon />
      </span>

      <ETCaption2 bold>Your Issue History will appear here</ETCaption2>
      <ETCaption3 color={Palette.neutral.main}>
        Adding New Update will create your Issue History
      </ETCaption3>
    </Stack>
  );
};
