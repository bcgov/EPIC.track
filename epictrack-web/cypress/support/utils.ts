export function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    // Add CORS headers specifically for OPTIONS requests
    if (method === "OPTIONS") {
      cy
        .intercept(method, url, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow all domains
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify allowed methods
            "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
          },
          body: null, // Empty response body for OPTIONS
        })
        .as(name);
    } else {
      // Regular API response handling
      cy
        .intercept(method, url, response ?? {})
        .as(name);
    }
  });
}
