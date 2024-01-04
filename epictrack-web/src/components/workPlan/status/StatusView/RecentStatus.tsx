import React from "react";
import { Box, Button } from "@mui/material";
import moment from "moment";
import { ETCaption1, ETPreviewText, GrayBox } from "../../../shared";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { Palette } from "../../../../styles/theme";
import { StatusContext } from "../StatusContext";
import { WorkplanContext } from "../../WorkPlanContext";
import { Else, If, Then, When } from "react-if";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../constants/application-constant";
import { Restricted } from "../../../shared/restricted";

const CheckCircleIcon: React.FC<IconProps> = Icons["CheckCircleIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];
const AddIcon: React.FC<IconProps> = Icons["AddIcon"];

const RecentStatus = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const {
    setIsCloning,
    setShowStatusForm,
    setStatus,
    setShowApproveStatusDialog,
  } = React.useContext(StatusContext);

  return (
    <GrayBox
      sx={{
        gap: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <ETCaption1 bold sx={{ letterSpacing: "0.39px" }}>
          {moment(statuses[0]?.posted_date)
            .format(MONTH_DAY_YEAR)
            .toUpperCase()}
        </ETCaption1>
        <If condition={!statuses[0].is_approved}>
          <Then>
            <ETCaption1
              bold
              sx={{
                color: Palette.error.dark,
                backgroundColor: Palette.error.bg.light,
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              Need Approval
            </ETCaption1>
          </Then>
          <Else>
            <When condition={statuses[0].is_approved}>
              <ETCaption1
                bold
                sx={{
                  color: Palette.success.dark,
                  backgroundColor: Palette.success.bg.light,
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Approved
              </ETCaption1>
            </When>
          </Else>
        </If>
      </Box>
      <ETPreviewText
        color={Palette.neutral.dark}
        sx={{ paddingTop: "16px", whiteSpace: "pre-wrap" }}
      >
        {statuses[0].description}
      </ETPreviewText>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <If condition={!statuses[0].is_approved}>
          <Then>
            <Button
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                setStatus(statuses[0]);
                setShowApproveStatusDialog(true);
              }}
              sx={{
                backgroundColor: "inherit",
                borderColor: "transparent",
              }}
            >
              Approve
            </Button>
          </Then>
          <Else>
            <Button
              startIcon={
                <AddIcon style={{ fill: Palette.primary.accent.main }} />
              }
              onClick={() => {
                setStatus(statuses[0]);
                setIsCloning(true);
                setShowStatusForm(true);
              }}
              sx={{
                backgroundColor: "inherit",
                borderColor: "transparent",
              }}
            >
              New Update
            </Button>
          </Else>
        </If>
        <If condition={statuses[0].is_approved}>
          <Restricted
            allowed={[ROLES.EXTENDED_EDIT]}
            errorProps={{ disabled: true }}
          >
            <Button
              startIcon={<PencilEditIcon />}
              onClick={() => {
                setShowStatusForm(true);
                setStatus(statuses[0]);
              }}
              sx={{
                backgroundColor: "inherit",
                borderColor: "transparent",
              }}
            >
              Edit
            </Button>
          </Restricted>
          <Else>
            <Button
              startIcon={<PencilEditIcon />}
              onClick={() => {
                setShowStatusForm(true);
                setStatus(statuses[0]);
              }}
              sx={{
                backgroundColor: "inherit",
                borderColor: "transparent",
              }}
            >
              Edit
            </Button>
          </Else>
        </If>
      </Box>
    </GrayBox>
  );
};

export default RecentStatus;
