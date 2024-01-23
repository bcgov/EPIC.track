import ReadMoreText from "../ReadMoreText";
import { faker } from "@faker-js/faker";
describe("ReadMoreText", () => {
  const longText = faker.lorem.paragraphs(3);

  it('should display "Read More" when text length exceeds maxLength and is not expanded', () => {
    cy.mount(
      <ReadMoreText
        children={longText}
        maxLength={50}
        defaultExpanded={false}
      />
    );
    cy.contains("Read More").should("be.visible");
  });

  it('should not display "Read More" when text length does not exceed maxLength', () => {
    cy.mount(
      <ReadMoreText
        children={longText}
        maxLength={600}
        defaultExpanded={false}
      />
    );
    cy.contains("Read More").should("not.exist");
  });

  it('should display "Read Less" when text length exceeds maxLength and is expanded', () => {
    cy.mount(
      <ReadMoreText children={longText} maxLength={50} defaultExpanded={true} />
    );
    cy.contains("Read Less").should("be.visible");
  });

  it('should toggle between "Read More" and "Read Less" when clicked', () => {
    cy.mount(
      <ReadMoreText
        children={longText}
        maxLength={50}
        defaultExpanded={false}
      />
    );
    cy.contains("Read More").click();
    cy.contains("Read Less").should("be.visible");
    cy.contains("Read More").should("not.exist");
    cy.contains("Read Less").click();
    cy.contains("Read More").should("be.visible");
    cy.contains("Read Less").should("not.exist");
  });
});
