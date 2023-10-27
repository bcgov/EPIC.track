import React from "react";
import { MultiValueProps } from "react-select";
import { Box } from "@mui/material";
import { ETCaption2 } from "..";
import { Palette } from "../../../styles/theme";

const MultiValue = ({ data, index, selectProps }: MultiValueProps) => {
  const { filterProps } = selectProps;

  // console.log(filterProps);

  return (
    <>
      {index === 0 && selectProps.value && (
        <Box
          sx={{
            background: Palette.white,
          }}
          key={index}
        >
          <ETCaption2>{filterProps?.label}</ETCaption2>
        </Box>
      )}
    </>
  );
};

export default MultiValue;
