import React from "react";
import Select, { Props } from "react-select";
import { FormHelperText } from "@mui/material";
import { Palette } from "../../../styles/theme";
import * as tokens from "../../../styles/designTokens";

type TrackSelectProps = Props & {
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

const TrackSelect = React.forwardRef<any, TrackSelectProps>(
  (
    { disabled, error = false, helperText = "", fullWidth = false, ...rest },
    ref,
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
                  ? tokens.supportBorderColorDanger
                  : state.isFocused
                    ? tokens.surfaceColorBorderActive
                    : tokens.surfaceColorBorderDefault,
                borderWidth: "2px",
                fontSize: tokens.typographyFontSizeBody,
                lineHeight: tokens.typographyLineHeightBody,
                backgroundColor: !!disabled
                  ? tokens.surfaceColorFormsDisabled
                  : Palette.white,
                fontWeight: tokens.typographyFontWeightsRegular,
                "&:hover": {
                  borderColor: error
                    ? tokens.supportBorderColorDanger
                    : tokens.surfaceColorBorderMedium,
                },
              };
            },
            placeholder: (base) => ({
              ...base,
              color: tokens.typographyColorPlaceholder,
            }),
            indicatorsContainer: (base) => ({
              ...base,
              zIndex: "auto",
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 1500,
              fontSize: tokens.typographyFontSizeBody,
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
  },
);

export default TrackSelect;
