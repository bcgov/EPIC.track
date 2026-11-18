import { AppConfig } from "config";
import { updateLastActiveTime } from "..";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;

describe("updateLastActiveTime", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "PATCH",
        pathname: new RegExp(`^${apiPath}staffs/\\d+/last_active_at$`),
      },
      {},
    ).as("lastActive");
  });

  it("records the staff member's activity", () => {
    cy.then(() => updateLastActiveTime(12));
    cy.wait("@lastActive")
      .its("request.url")
      .should("match", /staffs\/12\/last_active_at$/);
  });

  it("sends nothing for a user without a staff profile", () => {
    cy.then(() => updateLastActiveTime(0));
    cy.get("@lastActive.all").should("have.length", 0);
  });
});
