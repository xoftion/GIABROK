import { Message } from "../../../lib/backend/api";

interface ChatMessageProps {
  message: Message;
  formatMessageContent: (content: string) => React.ReactNode[];
}

export const ChatMessage = ({
  message,
  formatMessageContent,
}: ChatMessageProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex flex-col ${
        message.role === "user" ? "items-end" : "items-start"
      }`}
    >
      {message.role === "assistant" && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded shadow-sm" />
          <span className="text-sm font-medium text-white/90">Assistant</span>
          <span className="text-xs text-white/40">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed backdrop-blur-md border shadow-sm relative ${
          message.role === "user"
            ? "bg-blue-600/20 border-blue-500/30 text-white ml-8"
            : "bg-gray-700/60 border-gray-600/40 text-gray-100"
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
            <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_strong]:text-white [&_code]:bg-gray-600/60 [&_code]:text-gray-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-gray-500/30">
              {formatMessageContent(message.content)}
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
