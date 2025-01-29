import { Button, Grid } from "@mui/material";
import {
  ETHeading1,
  ETHeading3,
  ETPageContainer,
} from "../components/shared/index";
import { useNavigate } from "react-router-dom";
import { Palette } from "../styles/theme";

const Unauthorized = () => {
  const navigate = useNavigate();
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
          <Button
            onClick={() => {
              navigate("/");
            }}
          >
            Go to home page
          </Button>
        </Grid>
        <Grid item>
          <ETHeading1
            bold
            sx={{
              color: Palette.neutral.dark,
              lineHeight: "48px",
            }}
          >
            Unauthorized
          </ETHeading1>
        </Grid>
        <Grid item></Grid>

        <ETHeading3
          sx={{
            color: Palette.neutral.main,
            lineHeight: "32px",
          }}
        >
          You do not have the permission to view this page.
        </ETHeading3>
      </Grid>
    </ETPageContainer>
  );
};

export default Unauthorized;
