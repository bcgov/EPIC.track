export function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    cy.intercept(method, url, response).as(name);
  });
}
