import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle,
  Code,
  Edit3,
  File,
  GitBranch,
  Info,
  Navigation,
  Package,
  Terminal,
  Trash2,
} from "lucide-react";
import React from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  formatMessageContent: (content: string) => React.ReactNode[];
  containerId?: string;
}
const parseSpecialTags = (content: string, containerId?: string) => {
  const components: React.ReactNode[] = [];
  let currentIndex = 0;

  const patterns = {
    write: /<dec-write\s+(?:path|file_path)="([^"]+)">([\s\S]*?)<\/dec-write>/g,
    rename: /<dec-rename\s+from="([^"]+)"\s+to="([^"]+)"\s*\/>/g,
    delete: /<dec-delete\s+(?:path|file_path)="([^"]+)"\s*\/>/g,
    dependency:
      /<dec-add-dependency(?:\s+name="([^"]+)"(?:\s+version="([^"]+)")?)?>(.*?)<\/dec-add-dependency>/g,
    code: /<dec-code>([\s\S]*?)<\/dec-code>/g,
    thinking: /<dec-thinking>([\s\S]*?)<\/dec-thinking>/g,
    error: /<dec-error>([\s\S]*?)<\/dec-error>/g,
    success: /<dec-success>([\s\S]*?)<\/dec-success>/g,
    responseFormat: /<response_format>([\s\S]*?)<\/response_format>/g,
    userMessage: /<user_message>([\s\S]*?)<\/user_message>/g,
    aiMessage: /<ai_message>([\s\S]*?)<\/ai_message>/g,
    examples: /<examples>([\s\S]*?)<\/examples>/g,
    guidelines: /<guidelines>([\s\S]*?)<\/guidelines>/g,
    consoleLogs: /<console-logs>([\s\S]*?)<\/console-logs>/g,
    usefulContext: /<useful-context>([\s\S]*?)<\/useful-context>/g,
    currentRoute: /<current-route>([\s\S]*?)<\/current-route>/g,
    instructionsReminder:
      /<instructions-reminder>([\s\S]*?)<\/instructions-reminder>/g,
    lastDiff: /<last-diff>([\s\S]*?)<\/last-diff>/g,
  };

  const executeFileOperation = async (type: string, match: RegExpExecArray) => {
    if (!containerId) return;

    try {
      let response;

      switch (type) {
        case "write":
          console.log(
            `[FILE OP] Writing file: ${match[1]} (${
              match[2].trim().length
            } chars)`
          );
          response = await fetch(
            `http://localhost:3000/containers/${containerId}/files`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: match[1],
                content: match[2].trim(),
              }),
            }
          );
          console.log(
            `[FILE OP] Write file ${match[1]} - Status: ${response.status}`
          );
          break;
        case "rename":
          console.log(`[FILE OP] Renaming file: ${match[1]} → ${match[2]}`);
          response = await fetch(
            `http://localhost:3000/containers/${containerId}/files/rename`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ oldPath: match[1], newPath: match[2] }),
            }
          );
          console.log(
            `[FILE OP] Rename ${match[1]} → ${match[2]} - Status: ${response.status}`
          );
          break;
        case "delete":
          console.log(`[FILE OP] Deleting file: ${match[1]}`);
          response = await fetch(
            `http://localhost:3000/containers/${containerId}/files`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: match[1] }),
            }
          );
          console.log(
            `[FILE OP] Delete ${match[1]} - Status: ${response.status}`
          );
          break;
        case "dependency":
          const packageName = match[1] || match[3]?.trim();
          const version = match[2];
          console.log(
            `[FILE OP] Installing dependency: ${packageName} ${
              version ? `@${version}` : ""
            }`
          );
          response = await fetch(
            `http://localhost:3000/containers/${containerId}/dependencies`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ packageName, isDev: false }),
            }
          );
          console.log(
            `[FILE OP] Install ${packageName} - Status: ${response.status}`
          );
          break;
      }

      if (response && !response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`[FILE OP] ${type} operation completed successfully`);
    } catch (error) {
      console.error(`[FILE OP] ${type} operation failed:`, error);
    }
  };

  const parseNestedOperations = (text: string) => {
    const nestedPatterns = {
      write:
        /<dec-write\s+(?:path|file_path)="([^"]+)">([\s\S]*?)<\/dec-write>/g,
      rename: /<dec-rename\s+from="([^"]+)"\s+to="([^"]+)"\s*\/>/g,
      delete: /<dec-delete\s+(?:path|file_path)="([^"]+)"\s*\/>/g,
      dependency:
        /<dec-add-dependency\s+name="([^"]+)"(?:\s+version="([^"]+)")?\s*\/>/g,
    };

    Object.entries(nestedPatterns).forEach(([type, pattern]) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        executeFileOperation(type, match);
      }
    });
  };

  const allMatches: Array<{
    type: string;
    match: RegExpExecArray;
    start: number;
    end: number;
  }> = [];

  Object.entries(patterns).forEach(([type, pattern]) => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      allMatches.push({
        type,
        match,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });

  allMatches.sort((a, b) => a.start - b.start);

  allMatches.forEach((matchData, index) => {
    const { type, match, start, end } = matchData;

    if (start > currentIndex) {
      const beforeContent = content.slice(currentIndex, start);
      if (beforeContent.trim()) {
        components.push(
          <div
            key={`before-${index}`}
            className="prose prose-sm prose-invert max-w-none"
          >
            {beforeContent
              .split("\n")
              .filter((line) => line.trim())
              .map((line, i) => (
                <p key={i} className="mb-1">
                  {line}
                </p>
              ))}
          </div>
        );
      }
    }

    if (["write", "rename", "delete", "dependency"].includes(type)) {
      executeFileOperation(type, match);
    }

    if (type !== "code") {
      components.push(renderSpecialComponent(type, match, index));
    }
    currentIndex = end;
  });

  if (currentIndex < content.length) {
    const remainingContent = content.slice(currentIndex);
    if (remainingContent.trim()) {
      components.push(
        <div key="remaining" className="prose prose-sm prose-invert max-w-none">
          {remainingContent
            .split("\n")
            .filter((line) => line.trim())
            .map((line, i) => (
              <p key={i} className="mb-1">
                {line}
              </p>
            ))}
        </div>
      );
    }
  }

  return components.length > 0 ? components : null;
};

const renderSpecialComponent = (
  type: string,
  match: RegExpExecArray,
  index: number
): React.ReactNode => {
  switch (type) {
    case "write":
      return (
        <div
          key={`write-${index}`}
          className="my-4 bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-2 border-b border-blue-500/30">
            <File className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Create/Update File
            </span>
            <code className="ml-auto text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
              {match[1]}
            </code>
          </div>
          <div className="p-3">
            <pre className="bg-gray-800/60 rounded p-3 text-xs overflow-x-auto">
              <code className="text-gray-300">{match[2].trim()}</code>
            </pre>
          </div>
        </div>
      );

    case "rename":
      return (
        <div
          key={`rename-${index}`}
          className="my-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Rename File
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <code className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
              {match[1]}
            </code>
            <span className="text-yellow-400">→</span>
            <code className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
              {match[2]}
            </code>
          </div>
        </div>
      );

    case "delete":
      return (
        <div
          key={`delete-${index}`}
          className="my-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              Delete File
            </span>
            <code className="ml-auto text-xs text-red-300 bg-red-500/20 px-2 py-0.5 rounded">
              {match[1]}
            </code>
          </div>
        </div>
      );

    case "dependency":
      const packageName = match[1] || match[3]?.trim();
      return (
        <div
          key={`dependency-${index}`}
          className="my-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">
              Add Dependency
            </span>
            <code className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
              {packageName}
            </code>
          </div>
        </div>
      );

    case "code":
      return (
        <div
          key={`code-${index}`}
          className="my-4 bg-gray-500/10 border border-gray-500/30 rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-gray-500/20 px-3 py-2 border-b border-gray-500/30">
            <Code className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              Code Block
            </span>
          </div>
          <div className="p-3">
            <pre className="bg-gray-800/60 rounded p-3 text-xs overflow-x-auto">
              <code className="text-gray-300">{match[1].trim()}</code>
            </pre>
          </div>
        </div>
      );

    case "thinking":
      return (
        <div
          key={`thinking-${index}`}
          className="my-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">
              Thinking Process
            </span>
          </div>
          <div className="text-sm text-indigo-300 italic">
            {match[1].trim()}
          </div>
        </div>
      );

    case "error":
      return (
        <div
          key={`error-${index}`}
          className="my-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Error</span>
          </div>
          <div className="text-sm text-red-300">{match[1].trim()}</div>
        </div>
      );

    case "success":
      return (
        <div
          key={`success-${index}`}
          className="my-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Success</span>
          </div>
          <div className="text-sm text-green-300">{match[1].trim()}</div>
        </div>
      );

    case "consoleLogs":
      return (
        <div
          key={`console-${index}`}
          className="my-4 bg-gray-800/60 border border-gray-600/40 rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-gray-700/40 px-3 py-2 border-b border-gray-600/40">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              Console Output
            </span>
          </div>
          <div className="p-3">
            <pre className="text-xs text-green-400 font-mono">
              <code>{match[1].trim()}</code>
            </pre>
          </div>
        </div>
      );

    case "examples":
      return (
        <div
          key={`examples-${index}`}
          className="my-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Examples</span>
          </div>
          <div className="text-sm text-cyan-300">
            <pre className="bg-cyan-500/10 rounded p-2 text-xs overflow-x-auto">
              <code>{match[1].trim()}</code>
            </pre>
          </div>
        </div>
      );

    case "currentRoute":
      return (
        <div
          key={`route-${index}`}
          className="my-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              Current Route
            </span>
            <code className="ml-auto text-xs text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
              {match[1].trim()}
            </code>
          </div>
        </div>
      );

    case "lastDiff":
      return (
        <div
          key={`diff-${index}`}
          className="my-4 bg-pink-500/10 border border-pink-500/30 rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-pink-500/20 px-3 py-2 border-b border-pink-500/30">
            <GitBranch className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400">
              Recent Changes
            </span>
          </div>
          <div className="p-3">
            <pre className="bg-gray-800/60 rounded p-3 text-xs overflow-x-auto">
              <code className="text-gray-300">{match[1].trim()}</code>
            </pre>
          </div>
        </div>
      );

    case "instructionsReminder":
      return (
        <div
          key={`instructions-${index}`}
          className="my-3 bg-teal-500/10 border border-teal-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">
              Instructions
            </span>
          </div>
          <div className="text-sm text-teal-300">{match[1].trim()}</div>
        </div>
      );

    default:
      return (
        <div
          key={`default-${index}`}
          className="my-3 bg-gray-500/10 border border-gray-500/30 rounded-lg p-3"
        >
          <div className="text-sm text-gray-300">
            {match[1]?.trim() || match[0]}
          </div>
        </div>
      );
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  formatMessageContent,
  containerId,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasSpecialTags =
    /<dec-|<response_format|<user_message|<ai_message|<examples|<guidelines|<console-logs|<useful-context|<current-route|<instructions-reminder|<last-diff/.test(
      message.content
    );

  return (
    <div
      className={`flex flex-col ${
        message.role === "user" ? "items-end" : "items-start"
      }`}
    >
      {message.role === "assistant" && (
        <div className="flex items-center gap-2 mb-2 w-full">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded shadow-sm" />
          <span className="text-sm font-medium text-white/90">Assistant</span>
          <span className="text-xs text-white/40 ml-auto">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`rounded-xl px-4 py-3 text-sm leading-relaxed backdrop-blur-md border shadow-sm relative ${
          message.role === "user"
            ? "bg-blue-600/20 border-blue-500/30 text-white ml-8 max-w-[85%]"
            : "bg-gray-700/60 border-gray-600/40 text-gray-100 w-full"
        }`}
      >
        {message.role === "assistant" && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-transparent to-gray-700/10 rounded-xl" />
        )}
        {message.role === "user" && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/10 rounded-xl" />
        )}

        <div className="relative z-10">
          {message.role === "user" ? (
            <div>{message.content}</div>
          ) : (
            <div className="space-y-1">
              {hasSpecialTags ? (
                <>
                  {parseSpecialTags(message.content, containerId) || (
                    <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_strong]:text-white [&_code]:bg-gray-600/60 [&_code]:text-gray-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-gray-500/30">
                      {formatMessageContent(message.content)}
                    </div>
                  )}
                </>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_strong]:text-white [&_code]:bg-gray-600/60 [&_code]:text-gray-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-gray-500/30">
                  {formatMessageContent(message.content)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {message.role === "user" && (
        <span className="text-xs text-white/40 mt-1.5 mr-2">
          {formatTimestamp(message.timestamp)}
        </span>
      )}
    </div>
  );
};
