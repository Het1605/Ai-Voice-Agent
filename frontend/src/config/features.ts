import { env } from "./env";

export const FEATURE_FLAGS = {
  // Turn on/off features globally
  enablePhoneAgents: false, // Set to false for Phase 1
  enableTwilioIntegration: false,
  enableSipIntegration: false,
  enableStripeBilling: false, // Wait until Phase 10
  
  // Environment specific flags
  enableDebugPanel: env.NEXT_PUBLIC_APP_ENV === "development",
};
