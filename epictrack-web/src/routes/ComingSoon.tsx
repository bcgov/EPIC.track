import { Box, Container } from "@mui/material";
import { ETHeading1, ETHeading3, ETPageContainer } from "../components/shared";
import { Palette } from "../styles/theme";
import Icons from "../components/icons/index";
import { IconProps } from "../components/icons/type";

const PaintBrushIcon: React.FC<IconProps> = Icons["PaintBrushIcon"];

const ComingSoon = () => {
  return (
    <ETPageContainer
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
      padding={"2em 2em 1em 2em"}
      sx={{ height: "600px" }}
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
            <PaintBrushIcon sx={{ backgroundColor: "red" }} />
            <ETHeading1
              bold
              sx={{
                color: Palette.neutral.dark,
                lineHeight: "48px",
              }}
            >
              Coming soon!
            </ETHeading1>
            <ETHeading3
              sx={{
                color: Palette.neutral.main,
                lineHeight: "32px",
              }}
            >
              Our team is developing this feature and will launch it soon
            </ETHeading3>
          </Box>
        </Box>
      </Container>
    </ETPageContainer>
  );
};

export default ComingSoon;
