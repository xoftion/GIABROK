export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://giabrok.onrender.com";
export interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
  created: string;
  assignedPort: number | null;
  url: string | null;
  ports: Array<{
    private: number;
    public: number;
    type: string;
  }>;
  labels: Record<string, string>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: "image" | "document";
  data: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateContainerResponse {
  containerId: string;
  container: {
    id: string;
    containerId: string;
    status: string;
    port: number;
    url: string;
    createdAt: string;
    type: string;
  };
}

export interface StartContainerResponse {
  containerId: string;
  port: number;
  url: string;
  status: string;
  message: string;
}

export interface StopContainerResponse {
  containerId: string;
  status: string;
  message: string;
}

export interface DeleteContainerResponse {
  containerId: string;
  message: string;
}

export interface ChatResponse {
  success: boolean;
  userMessage: Message;
  assistantMessage: Message;
}

export interface ChatHistoryResponse {
  success: boolean;
  messages: Message[];
  sessionId: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getContainers(): Promise<Container[]> {
  const response = await fetchApi<{
    success: boolean;
    containers: Container[];
  }>("/containers");
  return response.containers;
}

export async function createContainer(): Promise<CreateContainerResponse> {
  const response = await fetchApi<
    { success: boolean } & CreateContainerResponse
  >("/containers/create", { method: "POST" });
  return response;
}

export async function startContainer(
  containerId: string
): Promise<StartContainerResponse> {
  const response = await fetchApi<
    { success: boolean } & StartContainerResponse
  >(`/containers/${containerId}/start`, { method: "POST" });
  return response;
}

export async function stopContainer(
  containerId: string
): Promise<StopContainerResponse> {
  const response = await fetchApi<{ success: boolean } & StopContainerResponse>(
    `/containers/${containerId}/stop`,
    { method: "POST" }
  );
  return response;
}

export async function deleteContainer(
  containerId: string
): Promise<DeleteContainerResponse> {
  const response = await fetchApi<
    { success: boolean } & DeleteContainerResponse
  >(`/containers/${containerId}`, { method: "DELETE" });
  return response;
}

export async function sendChatMessage(
  containerId: string,
  message: string,
  attachments?: any[]
): Promise<ChatResponse> {
  const response = await fetchApi<ChatResponse>(
    `/chat/${containerId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message, attachments }),
    }
  );
  return response;
}

export function sendChatMessageStream(
  containerId: string,
  message: string,
  attachments: any[] = [],
  onMessage: (data: any) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
): () => void {
  let abortController = new AbortController();

  fetch(`${API_BASE_URL}/chat/${containerId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, attachments, stream: true }),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                onComplete?.();
                return;
              }
              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  onMessage(parsed);
                } catch (e) {
                  console.error("Failed to parse SSE data:", data, e);
                }
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    })
    .catch((error) => {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Stream error:", error);
      onError?.(error.message || "Connection error");
    });

  return () => {
    abortController.abort();
  };
}

export async function getChatHistory(
  containerId: string
): Promise<ChatHistoryResponse> {
  const response = await fetchApi<ChatHistoryResponse>(
    `/chat/${containerId}/messages`
  );
  return response;
}
