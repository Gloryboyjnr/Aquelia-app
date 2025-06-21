import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;
  
  try {
    return {
      req,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating context:", error);
    return {
      req,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;

import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    console.error("tRPC error:", error);
    return {
      ...shape,
      data: {
        ...shape.data,
        timestamp: new Date().toISOString(),
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
    },
  });
});