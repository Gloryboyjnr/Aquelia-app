import { createTRPCRouter, publicProcedure } from "./create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const phoneNumberSchema = z.string().min(10).max(15);
const otpSchema = z.string().length(4);

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      message: "Backend is running successfully"
    };
  }),

  auth: createTRPCRouter({
    sendOtp: publicProcedure
      .input(z.object({
        phoneNumber: phoneNumberSchema
      }))
      .mutation(async ({ input }) => {
        try {
          // Always succeed in development
          return {
            success: true,
            message: "OTP sent successfully",
            reference: `otp_${Date.now()}_${input.phoneNumber}`,
            expiresIn: 300
          };
        } catch (error) {
          console.error("Error sending OTP:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send OTP. Please try again.",
            cause: error
          });
        }
      }),

    verifyOtp: publicProcedure
      .input(z.object({
        phoneNumber: phoneNumberSchema,
        otp: otpSchema
      }))
      .mutation(async ({ input }) => {
        try {
          // Only fail for 0000 in development
          if (input.otp === "0000") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid OTP. Please check your code and try again."
            });
          }
          
          return {
            success: true,
            message: "OTP verified successfully",
            token: `auth_token_${Date.now()}_${input.phoneNumber}`,
            user: {
              id: `user_${Date.now()}`,
              phoneNumber: input.phoneNumber,
              verified: true,
              verifiedAt: new Date().toISOString()
            }
          };
        } catch (error) {
          console.error("Error verifying OTP:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify OTP. Please try again.",
            cause: error
          });
        }
      })
  }),

  // Add payments router
  payments: createTRPCRouter({
    initialize: publicProcedure
      .input(z.object({
        amount: z.number(),
        email: z.string().email().optional(),
        phoneNumber: phoneNumberSchema,
        paymentMethod: z.enum(['card', 'mtn', 'telecel', 'airtel']),
        plan: z.string(),
        companyId: z.string()
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("Payment initialization request:", input);
          
          // Mock successful payment initialization
          return {
            success: true,
            message: "Payment initialized successfully",
            reference: `pay_${Date.now()}_${input.companyId}`,
            paymentUrl: input.paymentMethod === 'card' ? 'https://example.com/pay' : undefined
          };
        } catch (error) {
          console.error("Error initializing payment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to initialize payment. Please try again.",
            cause: error
          });
        }
      }),

    verify: publicProcedure
      .input(z.object({
        reference: z.string(),
        companyId: z.string()
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("Payment verification request:", input);
          
          // Mock successful payment verification
          return {
            success: true,
            message: "Payment verified successfully",
            status: "completed",
            plan: "basic",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        } catch (error) {
          console.error("Error verifying payment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify payment. Please try again.",
            cause: error
          });
        }
      })
  })
});

export type AppRouter = typeof appRouter;