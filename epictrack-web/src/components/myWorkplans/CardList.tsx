import React from "react";
import { Box } from "@mui/material";
import NoResultsFound from "../NoResultsFound";

const CardList = () => {
  const cards = [];

  if (cards.length === 0) {
    return <NoResultsFound />;
  }
  return <Box>This is a card list</Box>;
};

export default CardList;
