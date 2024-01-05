import React from "react";
import { App } from "./App";
import UserService from "./services/userService";
import { store } from "./store";
import { userAuthentication } from "./services/userService/userSlice";

describe("<App />", () => {
  it("renders", () => {
    cy.stub(UserService, "initKeycloak").as("initKeycloak");
    store.dispatch(userAuthentication(true));
    cy.mount(<App />);
    cy.get("@initKeycloak").should("be.called");
  });
});
