import CardList from "components/myUpdates/CardList";
import { Card, CardContent } from "@mui/material";
import { faker } from "@faker-js/faker";

describe("<CardList />", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      cy.stub(win, "IntersectionObserver").callsFake((callback) => {
        return {
          observe: (el: any) => {
            // trigger immediately
            callback([{ isIntersecting: true, target: el }]);
          },
          unobserve: () => {},
          disconnect: () => {},
        };
      });
    });
  });

  const TestCard = ({ item }: { item: { work_id: string; title: string } }) => (
    <Card>
      <CardContent>{item.title}</CardContent>
    </Card>
  );

  it("renders skeleton when loading", () => {
    cy.mount(
      <CardList
        items={[]}
        totalItems={0}
        loading={true}
        loadingMore={false}
        setLoadingMore={cy.stub()}
        lazyLoadMore={cy.stub()}
        CardComponent={TestCard}
      />
    );

    // rely on the skeleton MUI structure
    cy.get(".MuiSkeleton-root").should("exist");
  });

  it("renders 'No results found' when empty", () => {
    cy.mount(
      <CardList
        items={[]}
        totalItems={0}
        loading={false}
        loadingMore={false}
        setLoadingMore={cy.stub()}
        lazyLoadMore={cy.stub()}
        CardComponent={TestCard}
      />
    );

    cy.contains(/no results/i).should("exist");
  });

  it("renders cards when items are provided", () => {
    const items = Array.from({ length: 3 }, () => ({
      work_id: faker.string.uuid(),
      title: faker.lorem.words(2),
    }));

    cy.mount(
      <CardList
        items={items}
        totalItems={3}
        loading={false}
        loadingMore={false}
        setLoadingMore={cy.stub()}
        lazyLoadMore={cy.stub()}
        CardComponent={TestCard}
      />
    );

    items.forEach((item) => {
      cy.contains(item.title).should("exist");
    });
  });

  it("calls lazyLoadMore when TriggerOnViewed is observed", () => {
    const setLoadingMore = cy.stub().as("setLoadingMore");
    const lazyLoadMore = cy.stub().as("lazyLoadMore");

    const items = [
      { work_id: "1", title: "Card One" },
      { work_id: "2", title: "Card Two" },
    ];

    cy.mount(
      <CardList
        items={items}
        totalItems={5}
        loading={false}
        loadingMore={false}
        setLoadingMore={setLoadingMore}
        lazyLoadMore={lazyLoadMore}
        CardComponent={({ item }) => <div>{item.title}</div>}
      />
    );

    cy.get("@setLoadingMore").should("have.been.calledWith", true);
    cy.get("@lazyLoadMore").should("have.been.called");
  });
});
