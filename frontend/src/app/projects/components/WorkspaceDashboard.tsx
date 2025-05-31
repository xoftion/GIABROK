"use client";

import {
  ChevronLeft,
  Code2,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Menu,
  Monitor,
  RefreshCw,
  Smartphone,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getChatHistory,
  Message,
  sendChatMessage,
} from "../../../lib/backend/api";
import { ChatInput } from "../../create/components/ChatInput";
import { ChatMessage } from "../../create/components/ChatMessage";
import CodeEditor from "../../editor/CodeEditor";
import { LivePreview } from "./LivePreview";

interface WorkspaceDashboardProps {
  containerId: string;
}

export const WorkspaceDashboard = ({
  containerId,
}: WorkspaceDashboardProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"preview" | "editor">("preview");
  const [isDesktopView, setIsDesktopView] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerUrl, setContainerUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (containerId) {
      const fetchContainerUrl = async () => {
        try {
          const response = await fetch(`http://localhost:3000/containers`);
          const data = await response.json();
          if (data.success) {
            const container = data.containers.find(
              (c: any) => c.id === containerId
            );
            if (container && container.url) {
              setContainerUrl(container.url);
            }
          }
        } catch (error) {
          console.error("Error fetching container URL:", error);
        }
      };

      fetchContainerUrl();
      const interval = setInterval(fetchContainerUrl, 10000);
      return () => clearInterval(interval);
    }
  }, [containerId]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await getChatHistory(containerId);
        if (response.success) {
          if (response.messages.length === 0) {
            const welcomeMessage: Message = {
              id: "welcome",
              role: "assistant",
              content: `Welcome to your **Project Workspace**! 

## You're now working on Container: \`${containerId.slice(0, 8)}\`

This workspace provides:

### 🔄 **Live Preview**
- See your changes in real-time as you develop
- The preview updates automatically when you save files

### 💻 **Code Editor**
- Full-featured Monaco editor with syntax highlighting
- File tree navigation for your Next.js project
- TypeScript and JavaScript support

### 💬 **AI Assistant** 
- Ask questions about your code
- Get help with Next.js development
- Debug issues and get suggestions

### 🛠 **Development Tools**
- File management through the API
- Package installation capabilities
- Container control (start/stop)

## Getting Started:
1. Your application is running and visible in the preview pane
2. Switch to the code editor to make changes to your files
3. See results instantly in the live preview
4. Ask me any questions about your project!

What would you like to work on first?`,
              timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
          } else {
            setMessages(response.messages);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [containerId]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(containerId, userInput);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          response.userMessage,
          response.assistantMessage,
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefresh = () => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleExternalLink = () => {
    if (containerUrl) {
      window.open(containerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleExportCode = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/containers/${containerId}/export`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nextjs-project-${containerId.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatMessageContent = (content: string): React.ReactNode[] => {
    return content.split("\n").map((line: string, index: number) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
            {line.substring(3)}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-base font-semibold mt-3 mb-1">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-4 mb-2">
            {line.substring(2)}
          </h2>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        const match = line.match(/^(\d+\.)\s*(.*)$/);
        return (
          <li key={index} className="ml-4 list-decimal">
            {match ? match[2] : line}
          </li>
        );
      }
      if (line.includes("**") && line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index} className="mb-2">
            {parts.map((part: string, i: number) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.includes("`") && line.includes("`")) {
        const parts = line.split("`");
        return (
          <p key={index} className="mb-2">
            {parts.map((part: string, i: number) =>
              i % 2 === 1 ? (
                <code
                  key={i}
                  className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono"
                >
                  {part}
                </code>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      return line ? (
        <p key={index} className="mb-2">
          {line}
        </p>
      ) : (
        <br key={index} />
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background glassmorphism layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-600/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.03)_0%,_transparent_50%,_rgba(255,255,255,0.02)_100%)]" />

      <div className="flex flex-col w-full relative z-10">
        {/* Top Navigation */}
        <div className="h-14 bg-gray-900/70 backdrop-blur-xl border-b border-gray-700/40 flex items-center justify-between px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700/5 via-transparent to-gray-700/5" />

          {/* Left section */}
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <div className="w-7 h-7 bg-gray-700/60 backdrop-blur-sm border border-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/60 group-hover:border-gray-500/50 transition-all shadow-sm">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium">
                  {containerId.slice(0, 8)}
                </span>
                <span className="text-xs text-white/50">Next.js Project</span>
              </div>
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 relative z-10">
            {viewMode === "preview" && (
              <button
                onClick={() => setIsDesktopView(!isDesktopView)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all backdrop-blur-sm"
              >
                {isDesktopView ? (
                  <Monitor className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <div className="flex items-center gap-0.5 bg-gray-800/40 backdrop-blur-md rounded-lg p-0.5 border border-gray-700/40">
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "preview"
                    ? "bg-white/10 text-white shadow-sm backdrop-blur-sm"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setViewMode("editor")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "editor"
                    ? "bg-white/10 text-white shadow-sm backdrop-blur-sm"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code
              </button>
            </div>

            <div className="h-4 w-px bg-gray-700/40 mx-1" />

            <button
              onClick={handleRefresh}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all backdrop-blur-sm"
              disabled={!containerUrl}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExternalLink}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all backdrop-blur-sm"
              disabled={!containerUrl}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-700/40 mx-1" />

            <button
              onClick={handleExportCode}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-700/40 hover:bg-gray-600/50 disabled:bg-gray-700/20 text-white/90 hover:text-white disabled:text-white/50 rounded-md text-xs font-medium transition-all border border-gray-600/40 hover:border-gray-500/50 backdrop-blur-md shadow-sm"
            >
              {isExporting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white/90 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Export</span>
            </button>

            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-blue-500/20 backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deploy</span>
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Chat Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-gray-900/60 backdrop-blur-xl border-r border-gray-700/40 flex flex-col relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700/10 via-gray-800/5 to-gray-700/10" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.03)_0%,_transparent_50%,_rgba(255,255,255,0.02)_100%)]" />

              <div className="flex items-center gap-3 h-12 px-4 border-b border-gray-700/30 relative z-10">
                <Terminal className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white/90">
                  AI Assistant
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      formatMessageContent={formatMessageContent}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded" />
                        <span className="text-sm font-medium">Assistant</span>
                      </div>
                      <div className="max-w-[80%] rounded-xl px-3 py-3 text-sm leading-relaxed bg-gray-700/60 backdrop-blur-md text-gray-100 ml-2 border border-gray-600/40 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-gray-700/30 relative z-10">
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onSendMessage={handleSendMessage}
                  textareaRef={textareaRef}
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(148,163,184,0.15)_1px,_transparent_0)] bg-[length:32px_32px] opacity-5" />

            {viewMode === "preview" ? (
              <div className="h-full p-6 relative z-10">
                <div className="h-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/40 overflow-hidden shadow-2xl shadow-black/20">
                  <LivePreview
                    containerId={containerId}
                    isDesktopView={isDesktopView}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full relative z-10">
                <CodeEditor containerId={containerId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
