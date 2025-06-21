import app from "./hono";

const port = process.env.PORT || 4000;
const hostname = "0.0.0.0";

console.log(`🚀 Starting server...`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);
console.log(`Server will be available at: http://localhost:${port}`);

// For Railway deployment
if (typeof (globalThis as any).Bun !== 'undefined') {
  (globalThis as any).Bun.serve({
    port: parseInt(port.toString()),
    hostname,
    fetch: app.fetch,
  });
  console.log(`✅ Server running on http://localhost:${port}`);
} else {
  // Fallback for Node.js
  const server = app.fire();
  console.log(`✅ Server running on http://localhost:${port}`);
} 