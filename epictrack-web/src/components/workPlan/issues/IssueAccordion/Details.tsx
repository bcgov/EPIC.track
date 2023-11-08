import React from "react";
import { Button, Grid, IconButton, Stack } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import {
  ETCaption1,
  ETCaption2,
  ETHeading4,
  ETParagraph,
  GrayBox,
} from "../../../shared";
import moment from "moment";
import { ActiveChip, ErrorChip } from "../../../shared/chip/ETChip";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { Palette } from "../../../../styles/theme";
import { Else, If, Then, When } from "react-if";
import { IssuesContext } from "../IssuesContext";
import TrackDialog from "../../../shared/TrackDialog";

const IssueDetails = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[issue.updates.length - 1];
  const CheckCircleIcon: React.FC<IconProps> = icons["CheckCircleIcon"];
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
  const DeleteIcon: React.FC<IconProps> = icons["DeleteIcon"];

  const {
    setIssueToEdit,
    setShowIssuesForm,
    approveIssue,
    issueToApproveId,
    setIssueToApproveId,
  } = React.useContext(IssuesContext);

  const handleApproveIssue = () => {
    approveIssue(issue.id);
    setIssueToApproveId(null);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={6} sm={12}>
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
                      .format("MMM.DD YYYY")
                      .toUpperCase()}
                  </ETCaption1>
                </Grid>
                <If condition={issue.is_approved}>
                  <Then>
                    <Grid item xs="auto">
                      <ActiveChip label="Approved" />
                    </Grid>
                  </Then>
                  <Else>
                    <Grid item xs="auto">
                      <ErrorChip label="Need Approval" />
                    </Grid>
                  </Else>
                </If>
              </Grid>

              <Grid item xs={12}>
                <ETParagraph color={Palette.neutral.dark}>
                  {latestUpdate?.description}
                </ETParagraph>
              </Grid>

              <When condition={!issue.is_approved}>
                <Grid item>
                  <Button
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
              </When>

              <Grid item>
                <Button
                  variant="text"
                  startIcon={<PencilEditIcon />}
                  sx={{
                    backgroundColor: "inherit",
                    borderColor: "transparent",
                  }}
                  onClick={() => {
                    setIssueToEdit(issue);
                    setShowIssuesForm(true);
                  }}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </GrayBox>
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
