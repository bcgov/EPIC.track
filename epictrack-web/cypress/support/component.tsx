// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// "supportFile" configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// cypress/support/component.ts
if (!(String.prototype as any).replaceAll) {
  (String.prototype as any).replaceAll = function (
    search: string | RegExp,
    replacement: string | ((substring: string, ...args: any[]) => string)
  ) {
    const str = String(this);

    // If search is a RegExp, ensure global flag and use native replace
    if (search instanceof RegExp) {
      const flags = search.flags.includes("g") ? search.flags : `${search.flags}g`;
      const re = new RegExp(search.source, flags);
      return (str as any).replace(re, replacement as any);
    }

    // If replacement is a function, build a global RegExp from the string
    if (typeof replacement === "function") {
      const escaped = (search as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "g");
      return (str as any).replace(re, replacement as any);
    }

    // string-to-string replacement
    return str.split(search as string).join(replacement as string);
  };
}

import "@cypress/code-coverage/support";

// Import commands.js using ES2015 syntax:
import "./commands";
import { Provider } from "react-redux";
import { MemoryRouterProps } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { EnhancedStore } from "@reduxjs/toolkit";
import { RootState, store } from "../../src/store";
// Alternatively you can use CommonJS syntax:
// require("./commands")

import { MountOptions, MountReturn, mount } from "cypress/react";
import { BaseTheme } from "../../src/styles/theme";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mounts a React node
       * @param component React Node to mount
       * @param options Additional options to pass into mount
       */
      mount(
        component: React.ReactNode,
        options?: MountOptions & { routerProps?: MemoryRouterProps } & {
          reduxStore?: EnhancedStore<RootState>;
        }
      ): Cypress.Chainable<MountReturn>;
    }
  }
}

Cypress.Commands.add("mount", (component, options = {}) => {
  const {
    routerProps = { initialEntries: ["/"] },
    reduxStore = store,
    ...mountOptions
  } = options;

  const wrapped = (
    <Provider store={reduxStore}>
      <ThemeProvider theme={BaseTheme}>
        <StyledEngineProvider injectFirst>
          <SnackbarProvider maxSnack={3}>{component}</SnackbarProvider>
        </StyledEngineProvider>
      </ThemeProvider>
    </Provider>
  );

  return mount(wrapped, mountOptions);
});

// Example use:
// cy.mount(<MyComponent />)
