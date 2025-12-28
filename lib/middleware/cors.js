export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCors(request, handler) {
  return async (req, res) => {
    // Get origin from request
    const origin = request.headers.get('origin') || '*';

    // Set CORS headers
    const headers = corsHeaders(origin);

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers
      });
    }

    // Execute handler and add CORS headers to response
    const response = await handler(req, res);

    // Add CORS headers to the response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
