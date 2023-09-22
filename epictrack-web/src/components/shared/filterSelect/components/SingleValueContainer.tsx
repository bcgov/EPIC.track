import React from "react";
import { SingleValueProps, components } from "react-select";
import { Box } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { ETCaption2 } from "../..";
import { css as emotionCss } from "@emotion/react";
import clsx from "clsx";

const SingleValue = (props: SingleValueProps) => {
  return (
    <components.SingleValue {...props}>
      {props.selectProps.value ? (
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
          }}
          className={clsx(
            emotionCss(props.getStyles("singleValue", props)),
            props.className
          )}
        >
          <ETCaption2 bold color={Palette.primary.accent.light}>
            {props.selectProps.filterProps?.variant === "inline"
              ? "Filtered"
              : props.selectProps.placeholder}
          </ETCaption2>
        </Box>
      ) : (
        <ETCaption2 color={Palette.neutral.light}>
          {props.selectProps.placeholder}
        </ETCaption2>
      )}
      {/* {!props.selectProps.value && (
        <ETCaption2 color={Palette.neutral.light}>
          {/* {props.selectProps.placeholder} */}
      {/* No values?
        </ETCaption2>
      )} */}
    </components.SingleValue>
  );
};

export default SingleValue;
