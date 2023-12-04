import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import Card from "./Card";

const CardList = () => {
  const cards = [];
  if (cards.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <Grid container direction="row" spacing={2}>
      {[1, 2, 3, 4, 5].map(() => {
        return (
          <Grid item>
            <Card />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CardList;
