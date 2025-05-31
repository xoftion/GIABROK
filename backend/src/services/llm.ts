import OpenAI from "openai";
import prompt from "../utils/prompt.txt";

const openai = new OpenAI({
  apiKey: "sk-proj-k5bvQNgICFv5NpNBF5O8T3BlbkFJayi5cYm0YUb20wwYWGm6",
});

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  containerId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const chatSessions = new Map<string, ChatSession>();

export async function createChatSession(
  containerId: string
): Promise<ChatSession> {
  const sessionId = `${containerId}-${Date.now()}`;
  const session: ChatSession = {
    id: sessionId,
    containerId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  chatSessions.set(sessionId, session);
  return session;
}

export function getChatSession(sessionId: string): ChatSession | undefined {
  return chatSessions.get(sessionId);
}

export function getOrCreateChatSession(containerId: string): ChatSession {
  const existingSession = Array.from(chatSessions.values()).find(
    (session) => session.containerId === containerId
  );

  if (existingSession) {
    return existingSession;
  }

  const sessionId = `${containerId}-${Date.now()}`;
  const session: ChatSession = {
    id: sessionId,
    containerId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  chatSessions.set(sessionId, session);
  return session;
}

export async function sendMessage(
  containerId: string,
  userMessage: string
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  const session = getOrCreateChatSession(containerId);

  const userMsg: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString(),
  };

  session.messages.push(userMsg);

  const systemPrompt = `${prompt}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...session.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  // console.log(
  //   ...session.messages.map((msg) => ({
  //     role: msg.role as "user" | "assistant",
  //     content: msg.content,
  //   })), "message history"
  // );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.8,
  });

  console.log("ai response:", completion);

  const assistantContent =
    completion.choices[0]?.message?.content ||
    "Sorry, I could not generate a response.";

  const assistantMsg: Message = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };

  session.messages.push(assistantMsg);
  session.updatedAt = new Date().toISOString();

  return {
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  };
}
