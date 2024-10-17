import { Box, Grid, IconButton } from "@mui/material";
import { Palette } from "../../../styles/theme";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { ETHeading4, ETParagraph } from "..";
import { When } from "react-if";
import { WarningBoxProps } from "./type";

const ExclamationIcon: React.FC<IconProps> = Icons["ExclamationMediumIcon"];
const CloseIconComponent: React.FC<IconProps> = Icons["NotificationClose"];
const WarningBox = (props?: WarningBoxProps) => {
  return (
    <Grid
      sx={{
        backgroundColor: Palette.secondary.bg.light,
        padding: "16px 24px 16px 24px",
        display: "flex",
        flexDirection: "column",
        color: Palette.secondary.dark,
        borderRadius: "4px",
      }}
      container
    >
      <Grid
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
        }}
        item
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <ExclamationIcon width="26" height="24" />
        </Box>
        <Box sx={{ flex: "1 0 0" }}>
          <ETHeading4
            data-cy="warning-box-title"
            bold={props?.isTitleBold}
            sx={{
              ...(!props?.isTitleBold && {
                fontSize: "0.875rem",
              }),
            }}
          >
            {props?.title}
          </ETHeading4>
        </Box>
        <When condition={!!props?.onCloseHandler}>
          <Box>
            <IconButton
              onClick={props?.onCloseHandler}
              sx={{ width: "1.5rem", height: "1.5rem", padding: "0" }}
              disableRipple
            >
              <CloseIconComponent />
            </IconButton>
          </Box>
        </When>
      </Grid>
      <When condition={props?.subTitle}>
        <Grid item>
          <ETParagraph data-cy="warning-box-subtitle">
            {props?.subTitle}
          </ETParagraph>
        </Grid>
      </When>
    </Grid>
  );
};
export default WarningBox;
