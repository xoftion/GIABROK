// Make sure to replace the values with your actual environment variables

// USING ANTHROPIC CLAUDE SONNET 4 is strongly recommended for best results

export const config = {
  aiSdk: {
    // The base URL for the AI SDK, leave blank for e.g. openai
    baseUrl: "https://openrouter.ai/api/v1",

    // Use environment variable for API key
    apiKey: process.env.OPENROUTER_API_KEY || "",

    // The model to use, e.g., "gpt-4", "gpt-3.5-turbo", or "ollama/llama2"
    model: "anthropic/claude-sonnet-4",
  },
} as const;
