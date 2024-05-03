export function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    // Add CORS headers specifically for OPTIONS requests
    response = {
      ...response,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all domains
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify allowed methods
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
      },
      statusCode: 200, // Ensure the response is marked as successful
    };

    cy.intercept(method, url, response).as(name);
  });
}
