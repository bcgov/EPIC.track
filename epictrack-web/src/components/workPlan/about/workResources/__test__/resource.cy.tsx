import { MemoryRouter } from "react-router-dom";
import ResourceLink from "../resource";

const mountLink = (link: string) =>
  cy.mount(
    <MemoryRouter>
      <ResourceLink
        workResource={{ id: 1, title: "Resource", link, work_id: 1 }}
      />
    </MemoryRouter>,
  );

describe("ResourceLink", () => {
  it("renders http(s) links in a new tab without opener or referrer", () => {
    mountLink("https://www.bclaws.gov.bc.ca/doc");

    cy.contains("a", "Resource")
      .should("have.attr", "href", "https://www.bclaws.gov.bc.ca/doc")
      .and("have.attr", "target", "_blank")
      .and("have.attr", "rel", "noopener noreferrer");
  });

  it("does not render unsafe schemes as a link", () => {
    mountLink("javascript:alert(1)");

    cy.contains("Resource").should("exist");
    cy.get("a").should("not.exist");
  });
});
