import React from "react";
import EventDatePushConfirmForm from "../EventDatePushConfirmForm";

describe("EventDatePushConfirmForm", () => {
  it("renders both radio options", () => {
    cy.mount(<EventDatePushConfirmForm onSave={cy.stub()} />);

    cy.contains("Update this Milestone only").should("exist");
    cy.contains(/Update all subsequent\s+Milestones/).should("exist");
  });

  it("shows validation when submitted without selecting an option", () => {
    cy.mount(<EventDatePushConfirmForm onSave={cy.stub()} />);

    cy.get("#confirm-form").submit();
    cy.contains("Please choose one option").should("exist");
  });

  it("submits selected option to onSave", () => {
    const onSave = cy.stub().as("onSave");

    cy.mount(<EventDatePushConfirmForm onSave={onSave} />);

    cy.get('input[name="option"][value="1"]').check({ force: true });
    cy.get("#confirm-form").submit();

    cy.get("@onSave").should("have.been.calledOnce");
    cy.get("@onSave").then((stub: any) => {
      expect(stub.getCall(0).args[0]).to.equal(1);
    });
  });
});
