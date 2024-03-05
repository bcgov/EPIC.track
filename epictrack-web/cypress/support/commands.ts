/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import { userDetails } from "services/userService/userSlice";
import { ROLES } from "constants/application-constant";
import { store } from "store";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      setupUser: (
        this: Chainable<Subject>,
        roles: string[]
      ) => Chainable<Subject>;
    }
  }
}

declare global {
  interface Window {
    store: any; // replace 'any' with the type of your Redux store if you have one
  }
}

Cypress.Commands.add("setupUser", (roles: string[]) => {
  if (window.Cypress) {
    // expose the store to the Cypress window object when running Cypress tests
    window.store = store;
  }

  const fakeUserDetail = {
    sub: "fakeSub",
    groups: ["fakeGroup1", "fakeGroup2"],
    preferred_username: "fakeUsername",
    firstName: "fakeFirstName",
    lastName: "fakeLastName",
    email: "fakeEmail@example.com",
    staffId: 123,
    phone: "1234567890",
    position: "fakePosition",
    roles: roles,
  };

  cy.window().its("store").invoke("dispatch", userDetails(fakeUserDetail));
});
