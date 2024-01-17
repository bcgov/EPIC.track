import React from "react";
import { Button, Grid } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { ETCaption1, ETHeading4, ETParagraph, GrayBox } from "../../../shared";
import moment from "moment";
import { ActiveChip, ErrorChip } from "../../../shared/chip/ETChip";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { Palette } from "../../../../styles/theme";
import { Else, If, Then } from "react-if";
import { IssuesContext } from "../IssuesContext";
import TrackDialog from "../../../shared/TrackDialog";
import IssueHistory from "./IssueHistory";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../constants/application-constant";
import { Restricted } from "../../../shared/restricted";

const IssueDetails = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[0];
  const CheckCircleIcon: React.FC<IconProps> = icons["CheckCircleIcon"];
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
  const AddIcon: React.FC<IconProps> = icons["AddIcon"];

  const {
    setEditIssueUpdateFormIsOpen,
    approveIssue,
    issueToApproveId,
    setIssueToApproveId,
    setUpdateToClone,
    setUpdateToEdit,
    setNewIssueUpdateFormIsOpen,
  } = React.useContext(IssuesContext);

  const handleApproveIssue = () => {
    approveIssue(issue.id, latestUpdate.id);
    setIssueToApproveId(null);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={6} xs={12}>
          <GrayBox>
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                container
                spacing={2}
                justifyContent={"space-between"}
              >
                <Grid item xs={"auto"}>
                  <ETCaption1 bold color={Palette.neutral.dark}>
                    {moment(issue.created_at)
                      .format(MONTH_DAY_YEAR)
                      .toUpperCase()}
                  </ETCaption1>
                </Grid>
                <If condition={latestUpdate.is_approved}>
                  <Then>
                    <Grid item xs="auto">
                      <ActiveChip data-cy={`approved-chip`} label="Approved" />
                    </Grid>
                  </Then>
                  <Else>
                    <Grid item xs="auto">
                      <ErrorChip
                        data-cy={`need-approval-chip`}
                        label="Need Approval"
                      />
                    </Grid>
                  </Else>
                </If>
              </Grid>

              <Grid item xs={12}>
                <ETParagraph
                  data-cy="issue-description"
                  color={Palette.neutral.dark}
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {latestUpdate?.description}
                </ETParagraph>
              </Grid>

              <If condition={!latestUpdate.is_approved}>
                <Then>
                  <Grid item>
                    <Button
                      data-cy="approve-issue-update-button"
                      variant="text"
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setIssueToApproveId(issue.id);
                      }}
                    >
                      Approve
                    </Button>
                  </Grid>
                </Then>
                <Else>
                  <Grid item>
                    <Button
                      data-cy="new-issue-update-button"
                      variant="text"
                      startIcon={
                        <AddIcon
                          style={{ fill: Palette.primary.accent.main }}
                        />
                      }
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setUpdateToClone(latestUpdate);
                        setNewIssueUpdateFormIsOpen(true);
                      }}
                    >
                      New Update
                    </Button>
                  </Grid>
                </Else>
              </If>

              <Grid item>
                <If condition={latestUpdate.is_approved}>
                  <Restricted
                    allowed={[ROLES.EXTENDED_EDIT]}
                    errorProps={{ disabled: true }}
                  >
                    <Button
                      data-cy="edit-issue-update-button"
                      variant="text"
                      startIcon={<PencilEditIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setUpdateToEdit(latestUpdate);
                        setEditIssueUpdateFormIsOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </Restricted>
                  <Else>
                    <Button
                      data-cy="edit-issue-update-button"
                      variant="text"
                      startIcon={<PencilEditIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setUpdateToEdit(latestUpdate);
                        setEditIssueUpdateFormIsOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </Else>
                </If>
              </Grid>
            </Grid>
          </GrayBox>
        </Grid>

        <Grid item lg={6} xs={12}>
          <IssueHistory issue={issue} />
        </Grid>
      </Grid>

      <TrackDialog
        open={issueToApproveId === issue.id}
        dialogTitle="Approve this Issue?"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Save"
        onCancel={() => setIssueToApproveId(null)}
        onClose={() => setIssueToApproveId(null)}
        onOk={handleApproveIssue}
        isActionsRequired
      >
        <ETHeading4>
          Once approved, this issue will be automatically added to the report.
        </ETHeading4>
      </TrackDialog>
    </>
  );
};

export default IssueDetails;
