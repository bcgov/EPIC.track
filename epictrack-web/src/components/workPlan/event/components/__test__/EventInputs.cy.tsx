import React from "react";
import { Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import ExtensionInput from "../ExtensionInput";
import DecisionInput from "../DecisionInput";
import ExtensionSuspensionInput from "../ExtensionSuspensionInput";
import PCPInput from "../PCPInput";
import MultiDaysInput from "../MultiDaysInput";
import SingleDayPCPInput from "../SingleDayPCPInput";
import {
  WorkplanContext,
  initialWorkPlanContext,
} from "../../../WorkPlanContext";
import { outcomeConfigurationService } from "../../../../../services/outcomeConfigurationService/outcomeConfigurationService";
import { actSectionService } from "../../../../../services/actSectionService/actSectionService";

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      number_of_days: 0,
      phase_end_date: "",
      act_section_id: "",
      reason: "",
      decision_maker_id: "",
      outcome_id: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </FormProvider>
  );
};

describe("Event extension and decision inputs", () => {
  beforeEach(() => {
    cy.stub(outcomeConfigurationService, "getOutcomeConfigurations")
      .as("getOutcomeConfigurations")
      .resolves({
        status: 200,
        data: [{ id: 7, name: "Approved" }],
      } as any);

    cy.stub(actSectionService, "getActSectionsByEaAct")
      .as("getActSectionsByEaAct")
      .resolves({
        status: 200,
        data: [{ id: 2, name: "Section 25" }],
      } as any);
  });

  it("updates end date when number of days changes", () => {
    const onChangeDay = cy.stub().as("onChangeDay");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          selectedWorkPhase: {
            work_phase: {
              id: 12,
              end_date: "2026-03-10T00:00:00.000Z",
            },
          } as any,
          work: {
            id: 101,
            ea_act_id: 1,
          } as any,
        }}
      >
        <FormWrapper>
          <ExtensionInput
            isFormFieldsLocked={false}
            onChangeDay={onChangeDay}
          />
        </FormWrapper>
      </WorkplanContext.Provider>,
    );

    cy.contains("Current Phase End Date").should("exist");
    cy.get('input[name="number_of_days"]').clear().type("5");
    cy.get("@onChangeDay").should("have.been.called");
  });

  it("loads outcomes for decision input", () => {
    cy.mount(
      <FormWrapper>
        <DecisionInput
          configurationId={9}
          decisionMakers={[{ id: 1, full_name: "Alex Johnson" } as any]}
          isFormFieldsLocked={false}
        />
      </FormWrapper>,
    );

    cy.get("@getOutcomeConfigurations").should("have.been.calledWith", 9);
    cy.contains("Decision Maker").should("exist");
    cy.contains("Decision").should("exist");
  });

  it("loads act sections and updates reason count", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
            ea_act_id: 2,
          } as any,
        }}
      >
        <FormWrapper>
          <ExtensionSuspensionInput isFormFieldsLocked={false} />
        </FormWrapper>
      </WorkplanContext.Provider>,
    );

    cy.get("@getActSectionsByEaAct").should("have.been.calledWith", 2);
    cy.contains("Act Section").should("exist");
    cy.get('textarea[name="reason"]').type("abc");
    cy.contains("57/60 characters left").should("exist");
  });

  it("renders PCP input fields and updates topic character counter", () => {
    cy.mount(
      <FormWrapper>
        <PCPInput />
      </FormWrapper>,
    );

    cy.contains("Number of Responses").should("exist");
    cy.get('input[name="number_of_responses"]').clear().type("12");
    cy.get('input[name="number_of_responses"]').should("have.value", "12");

    cy.get('input[name="topic"]').type("abc");
    cy.contains("147/150 characters left").should("exist");
  });

  it("calls day change on mount and keeps fields disabled when locked", () => {
    const onChangeDay = cy.stub().as("onChangeDayLocked");
    const numberOfDaysRef = { current: null };
    const endDateRef = { current: null };

    cy.mount(
      <FormWrapper>
        <MultiDaysInput
          numberOfDaysRef={numberOfDaysRef as any}
          endDateRef={endDateRef as any}
          onChangeDay={onChangeDay}
          isFormFieldsLocked
        />
      </FormWrapper>,
    );

    cy.get("@onChangeDayLocked").should("have.been.calledOnce");
    cy.get('input[name="number_of_days"]').should("be.disabled");
    cy.get('input[placeholder="MM-DD-YYYY"]').should("be.disabled");
  });

  it("renders single day PCP input and accepts attendee count", () => {
    cy.mount(
      <FormWrapper>
        <SingleDayPCPInput />
      </FormWrapper>,
    );

    cy.contains("Number of Attendees").should("exist");
    cy.get('input[name="number_of_attendees"]').clear().type("8");
    cy.get('input[name="number_of_attendees"]').should("have.value", "8");
  });
});
