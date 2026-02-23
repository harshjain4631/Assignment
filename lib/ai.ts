// AI provider setup using Vercel AI SDK with Google Gemini.
// Uses gemini-3-flash-preview for both text and vision tasks.

import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize the Google Generative AI provider with API key from env.
// The GOOGLE_GENERATIVE_AI_API_KEY env var is read automatically by the SDK.
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Export the configured model for use in API routes.
// gemini-3-flash-preview supports both text generation and vision (multimodal).
export const aiModel = google("gemini-3-flash-preview");
