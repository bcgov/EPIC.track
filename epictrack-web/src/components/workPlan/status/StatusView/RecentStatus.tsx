import React from "react";
import { Box, Button } from "@mui/material";
import moment from "moment";
import {
  ETCaption1,
  ETDescription,
  ETPreviewText,
  GrayBox,
} from "../../../shared";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { Palette } from "../../../../styles/theme";
import { StatusContext } from "../StatusContext";
import { WorkplanContext } from "../../WorkPlanContext";
import { useAppSelector } from "../../../../hooks";

const CheckCircleIcon: React.FC<IconProps> = Icons["CheckCircleIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];
const CloneIcon: React.FC<IconProps> = Icons["CloneIcon"];

const RecentStatus = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm, setStatus, setShowApproveStatusDialog } =
    React.useContext(StatusContext);
  const { position } = useAppSelector((state) => state.user.userDetail);

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
          {moment(statuses[0]?.start_date).format("ll")}
        </ETCaption1>
        {statuses[0].approved === false ? (
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
        ) : (
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
        )}
      </Box>
      <ETPreviewText color={Palette.neutral.dark} sx={{ paddingTop: "16px" }}>
        {statuses[0].description}
      </ETPreviewText>
      <Box
        sx={{
          display: "flex",
        }}
      >
        {statuses[0].approved === false ? (
          <Button
            onClick={() => setShowApproveStatusDialog(true)}
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
        ) : (
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
        )}
        {/*TODO If approved hide button, unless superuser. */}
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
      </Box>
    </GrayBox>
  );
};

export default RecentStatus;
