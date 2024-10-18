import { Grid } from "@mui/material";
import { CardSkeleton } from "./Card/CardSkeleton";

export const CardListSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((key) => {
        return (
          <Grid item xs={4} key={key}>
            <CardSkeleton />
          </Grid>
        );
      })}
    </>
  );
};
