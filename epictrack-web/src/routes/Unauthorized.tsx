import { Box, Button, Container } from "@mui/material";
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
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
      padding={"2em 2em 1em 2em"}
      sx={{ height: "800px" }}
    >
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => {
                navigate("/");
              }}
            >
              Go to home page
            </Button>
            <ETHeading1
              bold
              sx={{
                color: Palette.neutral.dark,
                lineHeight: "48px",
              }}
            >
              Unauthorized
            </ETHeading1>
            <ETHeading3
              sx={{
                color: Palette.neutral.main,
                lineHeight: "32px",
              }}
            >
              You do not have the permission to view this page.
            </ETHeading3>
          </Box>
        </Box>
      </Container>
    </ETPageContainer>
  );
};

export default Unauthorized;
