import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import moment from "moment";
import { ETCaption1, ETPreviewText, GrayBox } from "../../../shared";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { Palette } from "../../../../styles/theme";
import { Else, If, Then, When } from "react-if";
import {
  MONTH_DAY_YEAR,
  ROLES,
  StalenessEnum,
} from "../../../../constants/application-constant";
import { Restricted } from "../../../shared/restricted";
import { Status } from "models/status";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];
const CheckCircleIcon: React.FC<IconProps> = Icons["CheckCircleIcon"];
const ExclamationIcon: React.FC<IconProps> = Icons["ExclamationMediumIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

interface RecentStatusProps {
  statuses: Status[];
  isActiveTeamMember: boolean;
  onEdit: (status: Status) => void;
  onApprove: (status: Status) => void;
  onClone: (status: Status) => void;
  userHasRole?: boolean;
  showStalenessIcon?: boolean;
}

const RecentStatus: React.FC<RecentStatusProps> = ({
  statuses,
  isActiveTeamMember,
  onEdit,
  onApprove,
  onClone,
  userHasRole = false,
  showStalenessIcon = false,
}) => {
  const currentStatus = statuses?.[0];
  if (!currentStatus) return null;

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <ETCaption1 bold sx={{ letterSpacing: "0.39px" }}>
            {moment(currentStatus?.posted_date)
              .format(MONTH_DAY_YEAR)
              .toUpperCase()}
          </ETCaption1>

          {showStalenessIcon &&
            (currentStatus.staleness === StalenessEnum.CRITICAL ||
              currentStatus.staleness === StalenessEnum.WARN) && (
              <Tooltip
                title={
                  currentStatus.staleness === StalenessEnum.CRITICAL
                    ? "This work status is out of date."
                    : "This work status is almost out of date."
                }
              >
                <Box
                  sx={{
                    width: "1.875rem",
                    height: "1.875rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ExclamationIcon
                    style={{
                      fill:
                        currentStatus.staleness === StalenessEnum.CRITICAL
                          ? Palette.error.main
                          : Palette.secondary.main,
                      marginLeft: "8px",
                    }}
                  />
                </Box>
              </Tooltip>
            )}
        </Box>
        <If condition={!currentStatus.is_approved}>
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
            <When condition={currentStatus.is_approved}>
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
        sx={{ paddingTop: "2px", whiteSpace: "pre-wrap" }}
      >
        {currentStatus.description}
      </ETPreviewText>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <If condition={!currentStatus.is_approved}>
          <Then>
            <Restricted allowed={[ROLES.EDIT]} exception={isActiveTeamMember}>
              <Button
                startIcon={<CheckCircleIcon />}
                onClick={() => onApprove(currentStatus)}
                sx={{
                  backgroundColor: "inherit",
                  borderColor: "transparent",
                }}
              >
                Approve
              </Button>
            </Restricted>
          </Then>
          <Else>
            <Restricted allowed={[ROLES.CREATE]} exception={isActiveTeamMember}>
              <Button
                startIcon={
                  <AddIcon style={{ fill: Palette.primary.accent.main }} />
                }
                onClick={() => onClone(currentStatus)}
                sx={{
                  backgroundColor: "inherit",
                  borderColor: "transparent",
                }}
              >
                New Update
              </Button>
            </Restricted>
          </Else>
        </If>
        <Restricted
          allowed={[statuses[0].is_approved ? ROLES.EXTENDED_EDIT : ROLES.EDIT]}
          errorProps={{ disabled: true }}
          exception={
            (!statuses[0].is_approved && isActiveTeamMember) || userHasRole
          }
        >
          <Button
            startIcon={<PencilEditIcon />}
            onClick={() => onEdit(currentStatus)}
            sx={{
              backgroundColor: "inherit",
              borderColor: "transparent",
            }}
          >
            Edit
          </Button>
        </Restricted>
      </Box>
    </GrayBox>
  );
};

export default RecentStatus;
