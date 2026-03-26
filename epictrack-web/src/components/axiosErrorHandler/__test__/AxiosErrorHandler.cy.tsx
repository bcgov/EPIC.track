import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import AxiosErrorHandler from "../AxiosErrorHandler";
import { AxiosInstance } from "../../../apiManager/http-request-handler";
import userSlice from "../../../services/userService/userSlice";
import uiStateSlice from "../../../styles/uiStateSlice";
import loadingSlice from "../../../services/loadingService";

describe("AxiosErrorHandler", () => {
  it("toggles loading state for mutating requests and cleans up interceptors", () => {
    let onRequest: any;
    let onResponse: any;
    let onError: any;

    const requestUse = cy
      .stub(AxiosInstance.interceptors.request, "use")
      .callsFake((handler: any) => {
        onRequest = handler;
        return 11;
      });
    const responseUse = cy
      .stub(AxiosInstance.interceptors.response, "use")
      .callsFake((success: any, error: any) => {
        onResponse = success;
        onError = error;
        return 22;
      });

    const requestEject = cy.stub(AxiosInstance.interceptors.request, "eject");
    const responseEject = cy.stub(AxiosInstance.interceptors.response, "eject");

    const reduxStore = configureStore({
      reducer: {
        user: userSlice,
        uiState: uiStateSlice,
        loadingState: loadingSlice,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });

    cy.mount(
      <AxiosErrorHandler>
        <div>child</div>
      </AxiosErrorHandler>,
      { reduxStore: reduxStore as any },
    ).then(() => {
      cy.wrap(requestUse).should("have.been.calledOnce");
      cy.wrap(responseUse).should("have.been.calledOnce");

      cy.then(() => {
        onRequest({ method: "post" });
        expect(reduxStore.getState().loadingState.isLoading).to.equal(true);

        const returned = onResponse({ config: { method: "delete" } });
        expect(returned.config.method).to.equal("delete");
        expect(reduxStore.getState().loadingState.isLoading).to.equal(false);

        onRequest({ method: "get" });
        expect(reduxStore.getState().loadingState.isLoading).to.equal(false);

        const noStatusResult = onError({ config: { method: "put" } });
        expect(noStatusResult.config.method).to.equal("put");
        expect(reduxStore.getState().loadingState.isLoading).to.equal(false);

        try {
          onError({ config: { method: "post" }, response: { status: 500 } });
          throw new Error("expected error to be thrown");
        } catch (error: any) {
          expect(error.response.status).to.equal(500);
        }
        expect(reduxStore.getState().loadingState.isLoading).to.equal(false);
      });

      cy.mount(<div>replacement</div>);

      cy.wrap(requestEject).should("have.been.calledWith", 11);
      cy.wrap(responseEject).should("have.been.calledWith", 22);
    });
  });
});
