import { Grid } from "@mui/material";
import Card from "./Card";

const CardList = () => {
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
