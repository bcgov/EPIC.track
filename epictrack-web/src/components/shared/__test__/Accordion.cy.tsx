import React from "react";
import ETAccordion from "../accordion/Accordion";
import ETAccordionSummary from "../accordion/components/AccordionSummary";
import ETAccordionDetails from "../accordion/components/AccordionDetails";

const TestAccordion = ({
  defaultOpen = true,
  onInteraction = () => {
    return;
  },
  children,
}: {
  defaultOpen?: boolean;
  onInteraction?: () => void;
  children?: React.ReactNode;
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(defaultOpen);

  return (
    <ETAccordion
      data-cy="accordion-component"
      expanded={expanded}
      onChange={() => {
        setExpanded(!expanded);

        if (!expanded) {
          onInteraction();
        }
      }}
    >
      <ETAccordionSummary expanded={expanded}>{children}</ETAccordionSummary>
      <ETAccordionDetails
        expanded={expanded}
        sx={{
          pt: "24px",
        }}
      >
        {children}
      </ETAccordionDetails>
    </ETAccordion>
  );
};

describe("IssueAccordion", () => {
  it("renders correctly", () => {
    cy.mount(<TestAccordion />);
  });

  it("expands and collapses on click", () => {
    cy.mount(<TestAccordion />);
    cy.get(".MuiAccordionSummary-root").should(
      "have.attr",
      "aria-expanded",
      "true"
    );
    cy.get(".MuiAccordionSummary-root").click();
    cy.get(".MuiAccordionSummary-root").should(
      "have.attr",
      "aria-expanded",
      "false"
    );
  });
});
