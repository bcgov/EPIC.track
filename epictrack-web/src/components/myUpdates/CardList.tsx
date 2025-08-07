import { FC } from "react";
import { Unless } from "react-if";
import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import { CardListSkeleton } from "../myWorkplans/CardListSkeleton";
import TriggerOnViewed from "../shared/DummyElement";

interface CardListProps<T> {
  items: T[];
  totalItems: number;
  loading: boolean;
  loadingMore: boolean;
  setLoadingMore: (value: boolean) => void;
  lazyLoadMore: () => any;
  CardComponent: FC<{ item: T } & any>;
  cardProps?: any;
}

const CardList = <T,>({
  items,
  totalItems,
  loading,
  loadingMore,
  lazyLoadMore,
  setLoadingMore,
  CardComponent,
  cardProps,
}: CardListProps<T>) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        <CardListSkeleton />
      </Grid>
    );
  }

  if (items.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <Grid container spacing={2}>
      {items.map((item: T, index: number) => (
        <Grid key={(item as any).work_id ?? index} item xs={4}>
          <CardComponent item={item} {...cardProps} />
        </Grid>
      ))}

      <Unless condition={loading || loadingMore || items.length === totalItems}>
        <TriggerOnViewed
          callbackFn={() => {
            setLoadingMore(true);
            lazyLoadMore();
          }}
        />
      </Unless>

      <Unless condition={items.length === totalItems}>
        <CardListSkeleton />
      </Unless>
    </Grid>
  );
};

export default CardList;
