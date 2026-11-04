import { safeExternalUrl } from "utils/urlUtils";

describe("urlUtils", () => {
  it("safeExternalUrl keeps http(s) links", () => {
    cy.wrap(safeExternalUrl("https://www.bclaws.gov.bc.ca/doc")).should(
      "eq",
      "https://www.bclaws.gov.bc.ca/doc",
    );
    cy.wrap(safeExternalUrl("http://example.com/a?b=1")).should(
      "eq",
      "http://example.com/a?b=1",
    );
  });

  it("safeExternalUrl rejects script, data and relative links", () => {
    [
      "javascript:alert(1)",
      " JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "/relative/path",
      "not a url",
      "",
      undefined,
    ].forEach((url) => {
      cy.wrap(safeExternalUrl(url)).should("be.undefined");
    });
  });
});
