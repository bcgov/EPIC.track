import React from "react";
import Select, { Props } from "react-select";
import { FormHelperText } from "@mui/material";
import { Palette } from "../../../styles/theme";

type TrackSelectProps = Props & {
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

const TrackSelect = React.forwardRef<any, TrackSelectProps>(
  (
    { disabled, error = false, helperText = "", fullWidth = false, ...rest },
    ref
  ) => {
    return (
      <>
        <Select
          ref={ref}
          menuPosition="fixed"
          isSearchable={true}
          isDisabled={!!disabled}
          isClearable={true}
          menuPortalTarget={document.body}
          styles={{
            control: (baseStyles, state) => {
              return {
                ...baseStyles,
                width: fullWidth ? "100%" : baseStyles.width,
                borderColor: error
                  ? "#d32f2f"
                  : state.isFocused
                  ? Palette.primary.accent.light
                  : Palette.neutral.accent.light,
                borderWidth: "2px",
                fontSize: "16px",
                lineHeight: "24px",
                backgroundColor: !!disabled
                  ? Palette.neutral.bg.dark
                  : Palette.white,
                fontWeight: "400",
                "&:hover": {
                  borderColor: Palette.primary.accent.light,
                },
              };
            },
            indicatorsContainer: (base) => ({
              ...base,
              zIndex: "auto",
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 1500,
              fontSize: "1rem",
            }),
          }}
          {...rest}
        />
        {error && (
          <FormHelperText
            error
            className="MuiFormHelperText-sizeSmall"
            style={{ marginInline: "14px" }}
          >
            {helperText}
          </FormHelperText>
        )}
      </>
    );
  }
);

export default TrackSelect;
