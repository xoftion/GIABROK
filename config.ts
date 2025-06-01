// Make sure to replace the values with your actual API key and model
export const config = {
  aiSdk: {
    // The base URL for the AI SDK, leave blank for
    baseUrl: "localhost:8000",

    // Your API key for provider, if using Ollama enter "ollama" here
    apiKey: "sk-1234567890abcdef",

    // The model to use, e.g., "gpt-4", "gpt-3.5-turbo", or "ollama/llama2"
    model: "gpt-4o",
  },
} as const;
