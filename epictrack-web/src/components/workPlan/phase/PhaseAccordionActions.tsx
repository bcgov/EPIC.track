import { Box, Button, IconButton, Tooltip } from "@mui/material";
import React from "react";
import { styled } from "@mui/system";

import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";
import { PhaseContainerProps } from "./type";
import { WorkplanContext } from "../WorkPlanContext";
import workService from "../../../services/workService/workService";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const IButton = styled(IconButton)({
  "& .icon": {
    fill: Palette.primary.main,
  },
  "&:hover": {
    backgroundColor: Palette.neutral.bg.main,
    borderRadius: "4px",
  },
});

const PhaseAccordionActions = ({ workId }: PhaseContainerProps) => {
  const ctx = React.useContext(WorkplanContext);
  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadWorkplan(
        workId,
        Number(ctx.selectedPhaseId)
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `file.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {}
  }, [workId, ctx.selectedPhaseId]);
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Button variant="contained">Add Task</Button>
        <Button variant="outlined">Add Milestone</Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: ".5rem",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Tooltip title="Import tasks from template">
            <IButton>
              <ImportFileIcon className="icon" />
            </IButton>
          </Tooltip>
          <Tooltip title="Export workplan to excel">
            <IButton onClick={downloadPDFReport}>
              <DownloadIcon className="icon" />
            </IButton>
          </Tooltip>
        </Box>
        {/* TODO: Add pagination details */}
      </Box>
    </Box>
  );
};

export default PhaseAccordionActions;
