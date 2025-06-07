const API_BASE_URL = "http://localhost:4000";

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
  message: string
): Promise<ChatResponse> {
  const response = await fetchApi<ChatResponse>(
    `/chat/${containerId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
  return response;
}

export async function getChatHistory(
  containerId: string
): Promise<ChatHistoryResponse> {
  const response = await fetchApi<ChatHistoryResponse>(
    `/chat/${containerId}/messages`
  );
  return response;
}
