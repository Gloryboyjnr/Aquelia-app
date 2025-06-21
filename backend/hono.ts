import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

// More permissive CORS for development
app.use("*", cors({
  origin: "*", // Allow all origins in development for easier testing
  allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-TRPC"],
  credentials: true,
  maxAge: 600, // 10 minutes
}));

// Request logging middleware with more details
app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = new URL(c.req.url);
  const path = url.pathname;
  
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  
  try {
    await next();
    
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${path} - ${c.res.status} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${method} ${path} - Error (${duration}ms):`, error);
    throw error;
  }
});

// Improved health check endpoint
app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Test endpoint with more information
app.get("/api/test", (c) => {
  return c.json({ 
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Simple OTP test endpoint (bypasses tRPC)
app.post("/api/test-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phoneNumber } = body;
    
    if (!phoneNumber) {
      return c.json({ error: "Phone number is required" }, 400);
    }
    
    console.log(`[OTP Test] Sending OTP to: ${phoneNumber}`);
    
    // Mock OTP response
    const response = {
      success: true,
      message: "OTP sent successfully (test mode)",
      reference: `otp_${Date.now()}_${phoneNumber}`,
      expiresIn: 300,
      phoneNumber,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[OTP Test] Response:`, response);
    
    return c.json(response);
  } catch (error) {
    console.error("[OTP Test] Error:", error);
    return c.json({ 
      error: "Failed to send OTP",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// tRPC endpoint with better error handling
app.use("/api/trpc", trpcServer({
  router: appRouter,
  createContext,
  onError: ({ error, type, path, input, ctx, req }) => {
    console.error(`[tRPC Error] ${type} ${path}:`, {
      error,
      input,
      url: req.url,
      method: req.method,
    });
  },
}));

// Root endpoint with more information
app.get("/", (c) => {
  return c.json({ 
    status: "ok",
    message: "API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// Improved 404 handler
app.notFound((c) => {
  const url = new URL(c.req.url);
  console.warn(`[404] Route not found: ${c.req.method} ${url.pathname}`);
  return c.json({
    error: "Not Found",
    message: `Route ${c.req.method} ${url.pathname} not found`,
    timestamp: new Date().toISOString()
  }, 404);
});

// Improved error handler
app.onError((err, c) => {
  console.error("[Server Error]", {
    error: err,
    url: c.req.url,
    method: c.req.method,
    timestamp: new Date().toISOString()
  });
  
  return c.json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred",
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;