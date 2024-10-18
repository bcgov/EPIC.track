import React from "react";
import { MultiValueProps } from "react-select";
import { Box } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { ETCaption2 } from "../..";

const MultiValue = (props: MultiValueProps) => {
  const { filterProps } = props.selectProps;
  return (
    <>
      {props.index === 0 && props.selectProps.value && (
        <Box
          sx={{
            display: "flex",
            height: "2.25rem",
            // padding: "0px 12px",
            alignItems: "center",
            alignSelf: "stretch",
            borderRadius: "4px",
            background: Palette.primary.bg.light,
            cursor: "pointer",
            maxWidth: "70%",
          }}
          key={props.index}
        >
          <ETCaption2
            bold
            color={Palette.primary.accent.light}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {filterProps?.variant === "inline"
              ? "Filtered"
              : `${props.selectProps.placeholder} (${
                  (props.selectProps.value as []).length
                })`}
          </ETCaption2>
        </Box>
      )}
      {props.index === 0 && !filterProps?.selectedOptions && (
        <ETCaption2 color={Palette.neutral.light}>
          {props.selectProps.placeholder}
        </ETCaption2>
      )}
    </>
  );
};

export default MultiValue;
