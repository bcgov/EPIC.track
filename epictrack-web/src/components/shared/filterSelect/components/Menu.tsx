import React from "react";
import { Box, Button } from "@mui/material";

import { components, MenuProps } from "react-select";
import { Palette } from "../../../../styles/theme";
import { ETParagraph } from "../..";

const Menu = (props: MenuProps) => {
  const { filterProps } = props.selectProps;
  return (
    <>
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          borderRadius: "4px",
          border: `1px solid ${Palette.neutral.accent.light}`,
          background: `${Palette.white}`,
          boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.10)",
        }}
      >
        <components.Menu {...props}>
          {props.options.length > 5 && (
            <Box
              sx={{
                display: "flex",
                padding: ".5rem 1rem",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "space-between",
                background: Palette.neutral.bg.light,
              }}
            >
              {filterProps?.selectedOptions && (
                <ETParagraph color={Palette.black}>
                  {filterProps?.selectedOptions.length} selected
                </ETParagraph>
              )}
              <Button variant="text" onClick={filterProps?.clearFilters}>
                Clear Filters
              </Button>
            </Box>
          )}
          <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {props.children}
          </Box>
          <Box
            sx={{
              display: "flex",
              padding: "1rem",
              alignItems: "flex-start",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              onClick={filterProps?.onCancel}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={filterProps?.applyFilters}
              fullWidth
            >
              Apply
            </Button>
          </Box>
        </components.Menu>
      </Box>
    </>
  );
};

export default Menu;
