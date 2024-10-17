import React from "react";
import Box from "@mui/material/Box";
import { Palette } from "../../../styles/theme";
import { useAppDispatch } from "../../../hooks";
import { envBanner } from "../../../styles/uiStateSlice";
import InfoIcon from "../../../assets/images/infoIcon.svg";
import { ETSubhead } from "../../shared";
import { AppConfig } from "../../../config";
import { EMPTY_ENV_BANNER_HEIGHT, ENV_BANNER_HEIGHT } from "./constants";
const EnvironmentBanner = () => {
  const dispatch = useAppDispatch();
  const env = AppConfig.environment;
  const isTestEnvironment = ["dev", "test", "demo", "localhost"].includes(env);

  React.useEffect(() => {
    dispatch(envBanner(isTestEnvironment));
  }, []);

  if (!isTestEnvironment) {
    return (
      <Box
        sx={{
          height: EMPTY_ENV_BANNER_HEIGHT,
          background: Palette.secondary.main,
          boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.10)",
        }}
      ></Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: Palette.secondary.main,
        color: Palette.neutral.accent.dark,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        paddingBlock: "8px",
        height: ENV_BANNER_HEIGHT,
        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.10)",
      }}
      textAlign="center"
    >
      <Box component="img" src={InfoIcon} alt="EPIC.track" />
      <ETSubhead>You are using a {env.toUpperCase()} environment</ETSubhead>
    </Box>
  );
};

export default EnvironmentBanner;
