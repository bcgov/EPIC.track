import React from "react";
import { Box, Button } from "@mui/material";
import moment from "moment";
import { ETCaption1, ETPreviewText, GrayBox } from "../../../shared";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { Palette } from "../../../../styles/theme";
import { StatusContext } from "../StatusContext";
import { WorkplanContext } from "../../WorkPlanContext";
import { useAppSelector } from "../../../../hooks";
import { Else, If, Then, When } from "react-if";

const CheckCircleIcon: React.FC<IconProps> = Icons["CheckCircleIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];
const CloneIcon: React.FC<IconProps> = Icons["CloneIcon"];

const RecentStatus = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm, setStatus, setShowApproveStatusDialog } =
    React.useContext(StatusContext);
  // const { position } = useAppSelector((state) => state.user.userDetail);

  return (
    <GrayBox
      sx={{
        width: "50%",
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
          {moment(statuses[0]?.posted_date).format("ll")}
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
      <ETPreviewText color={Palette.neutral.dark} sx={{ paddingTop: "16px" }}>
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
              onClick={() => {
                setStatus(statuses[0]);
                setShowApproveStatusDialog(true);
              }}
              sx={{
                display: "flex",
                gap: "8px",
                backgroundColor: Palette.neutral.bg.light,
                borderColor: Palette.neutral.bg.light,
                ":hover": {
                  backgroundColor: Palette.neutral.bg.light,
                  borderColor: Palette.neutral.bg.light,
                },
              }}
            >
              <CheckCircleIcon />
              Approve
            </Button>
          </Then>
          <Else>
            <Button
              sx={{
                display: "flex",
                gap: "8px",
                backgroundColor: Palette.neutral.bg.light,
                borderColor: Palette.neutral.bg.light,
                ":hover": {
                  backgroundColor: Palette.neutral.bg.light,
                  borderColor: Palette.neutral.bg.light,
                },
              }}
            >
              <CloneIcon />
              Clone
            </Button>
          </Else>
        </If>
        <If condition={!statuses[0].is_approved}>
          <Button
            onClick={() => {
              setShowStatusForm(true);
              setStatus(statuses[0]);
            }}
            sx={{
              display: "flex",
              gap: "8px",
              backgroundColor: Palette.neutral.bg.light,
              borderColor: Palette.neutral.bg.light,
              ":hover": {
                backgroundColor: Palette.neutral.bg.light,
                borderColor: Palette.neutral.bg.light,
              },
            }}
          >
            <PencilEditIcon />
            Edit
          </Button>
        </If>
      </Box>
    </GrayBox>
  );
};

export default RecentStatus;
