import React from "react";
import { MasterContext, MasterProvider } from "components/shared/MasterContext";

const makeService = () => ({
  getAll: cy
    .stub()
    .resolves({ status: 200, data: [{ id: "1", name: "Item A" }] }),
  getById: cy
    .stub()
    .resolves({ status: 200, data: { id: "1", name: "Item A" } }),
  create: cy.stub().resolves({ status: 201, data: { id: "2" } }),
  update: cy.stub().resolves({ status: 200, data: { id: "1" } }),
  delete: cy.stub().resolves({ status: 200, data: {} }),
});

const Harness = ({ service }: { service: any }) => {
  const context = React.useContext(MasterContext);

  React.useEffect(() => {
    context.setTitle("Project");
    context.setService(service);
  }, []);

  return (
    <div>
      <div data-cy="title">{context.title}</div>
      <div data-cy="data-count">{context.data.length}</div>
      <div data-cy="item-name">{(context.item as any)?.name || ""}</div>
      <button data-cy="set-id" onClick={() => context.setId("1")}>
        set id
      </button>
      <button
        data-cy="save"
        onClick={() =>
          context.onSave({ name: "New Name" }, () => {
            (window as any).__saved = ((window as any).__saved || 0) + 1;
          })
        }
      >
        save
      </button>
    </div>
  );
};

describe("MasterProvider", () => {
  it("loads data and fetches item by id", () => {
    const service = makeService();

    cy.mount(
      <MasterProvider>
        <Harness service={service} />
      </MasterProvider>,
    );

    cy.get("[data-cy='title']").contains("Project");
    cy.wrap(service.getAll).should("have.been.called");
    cy.get("[data-cy='data-count']").contains("1");

    cy.get("[data-cy='set-id']").click();
    cy.wrap(service.getById).should("have.been.calledWith", "1");
    cy.get("[data-cy='item-name']").contains("Item A");
  });

  it("uses create path when id is not set", () => {
    const service = makeService();

    cy.mount(
      <MasterProvider>
        <Harness service={service} />
      </MasterProvider>,
    );

    cy.get("[data-cy='save']").click();

    cy.wrap(service.create).should("have.been.called");
    cy.wrap(service.update).should("not.have.been.called");
  });

  it("uses update path when id is set", () => {
    const service = makeService();

    cy.mount(
      <MasterProvider>
        <Harness service={service} />
      </MasterProvider>,
    );

    cy.get("[data-cy='set-id']").click();
    cy.get("[data-cy='save']").click();

    cy.wrap(service.update).should(
      "have.been.calledWith",
      { name: "New Name" },
      "1",
    );
    cy.wrap(service.create).should("not.have.been.called");
  });
});
