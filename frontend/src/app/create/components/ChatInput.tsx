import { FileText, Plus, Send } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export const ChatInput = ({
  inputValue,
  setInputValue,
  onSendMessage,
  textareaRef,
  onKeyDown,
  disabled = false,
}: ChatInputProps) => {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 p-3 bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-sm relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 via-transparent to-gray-600/10 rounded-xl" />

        <div className="flex items-end gap-3 relative z-10">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your project..."
              disabled={disabled}
              className="w-full bg-transparent text-white placeholder-zinc-400 resize-none focus:outline-none py-2 px-0 min-h-[40px] max-h-[120px] text-sm leading-relaxed disabled:opacity-50"
              rows={1}
              style={{
                height: "auto",
                minHeight: "40px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <button
            type="button"
            onClick={onSendMessage}
            disabled={!inputValue.trim() || disabled}
            className="flex-shrink-0 p-2 bg-blue-600/90 hover:bg-blue-600 disabled:bg-zinc-700/50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm hover:shadow-blue-500/20 disabled:shadow-none backdrop-blur-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all disabled:opacity-50 backdrop-blur-sm"
              disabled={disabled}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white hover:bg-gray-700/50 px-2 py-1 rounded-md transition-all disabled:opacity-50 backdrop-blur-sm"
              disabled={disabled}
            >
              <FileText className="w-4 h-4" />
              Attach
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-gray-600/50 rounded-lg text-zinc-400 hover:text-white hover:border-gray-500/50 hover:bg-gray-700/30 transition-all disabled:opacity-50 backdrop-blur-sm"
              disabled={disabled}
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
