import { Skeleton } from "@mui/material";
import { CARD_BODY_HEIGHT } from "./CardBody";
import { CARD_HEADER_HEIGHT } from "./CardHeader";
import { CARD_FOOTER_HEIGHT } from "./CardFooter";

// Derived from the real card so the placeholder cannot drift from it; it was
// hardcoded to 446 while the card measured 451.
const CARD_HEIGHT =
  parseInt(CARD_HEADER_HEIGHT, 10) +
  parseInt(CARD_BODY_HEIGHT, 10) +
  parseInt(CARD_FOOTER_HEIGHT, 10);

export const CardSkeleton = () => {
  return <Skeleton variant="rectangular" height={CARD_HEIGHT} />;
};
