import { Button, Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import {
  ETCardFooterContent,
  ETCardFooterTitle,
  ETPreviewText,
} from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";

const EyeIcon: React.FC<IconProps> = Icons["EyeIcon"];

const CardFooter = () => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      sx={{
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 32px",
        alignItems: "center",
      }}
    >
      <Grid item>
        <Grid container spacing={2}>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCardFooterTitle>TEAM</ETCardFooterTitle>
              </Grid>
              <Grid item>
                <ETCardFooterContent>MMT</ETCardFooterContent>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCardFooterTitle>PROJECT LEAD</ETCardFooterTitle>
              </Grid>
              <Grid item>
                <ETCardFooterContent>Katherine St James</ETCardFooterContent>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCardFooterTitle>STAFF</ETCardFooterTitle>
              </Grid>
              <Grid item>{/* TODO: Staff icon display here */}</Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Button
          variant="text"
          startIcon={<EyeIcon />}
          sx={{
            backgroundColor: "inherit",
            borderColor: "transparent",
          }}
          onClick={() => undefined}
        >
          <ETPreviewText sx={{ fontWeight: "bold", lineHeight: "16px" }}>
            View Only
          </ETPreviewText>
        </Button>
      </Grid>
    </Grid>
  );
};

export default CardFooter;
