import { Box, Button, IconButton } from "@mui/material";
import React from "react";

import Icons from "../../icons";
import { IconProps } from "../../icons/type";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const PhaseAccordionActions = () => {
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
          <IconButton>
            <ImportFileIcon />
          </IconButton>
          <IconButton>
            <DownloadIcon />
          </IconButton>
        </Box>
        {/* TODO: Add pagination details */}
      </Box>
    </Box>
  );
};

export default PhaseAccordionActions;
