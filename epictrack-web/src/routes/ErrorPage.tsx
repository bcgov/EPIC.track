import { Button, Grid } from "@mui/material";
import {
  ETHeading1,
  ETHeading3,
  ETPageContainer,
} from "../components/shared/index";
import { Palette } from "../styles/theme";

const ErrorPage = ({ onReset }: { onReset: () => void }) => {
  return (
    <ETPageContainer
      container
      sx={{
        height: "800px",
      }}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: "100%",
        }}
      >
        <Grid item>
          <Button onClick={onReset}>Go to home page</Button>
        </Grid>
        <Grid item>
          <ETHeading1
            bold
            sx={{
              color: Palette.neutral.dark,
              lineHeight: "48px",
            }}
          >
            Oops
          </ETHeading1>
        </Grid>
        <Grid item></Grid>

        <ETHeading3
          sx={{
            color: Palette.neutral.main,
            lineHeight: "32px",
          }}
        >
          An unexpected error happened.
        </ETHeading3>
      </Grid>
    </ETPageContainer>
  );
};

export default ErrorPage;
