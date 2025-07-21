import { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = message.length;
  const isOverLimit = charCount > 500;
  const canSend = message.trim() && !isLoading && !isOverLimit;

  return (
    <footer className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="w-12 h-12 rounded-full flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute bottom-3 left-3 h-auto p-0 text-on-surface-variant hover:text-primary z-10"
            >
              <Smile className="w-5 h-5" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-16 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm leading-relaxed min-h-[48px] max-h-32"
              rows={1}
              maxLength={500}
              disabled={isLoading}
            />
            
            <div className={`absolute bottom-1 right-3 text-xs ${isOverLimit ? 'text-destructive' : 'text-on-surface-variant'}`}>
              <span>{charCount}</span>/500
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!canSend}
          className="w-12 h-12 rounded-full flex-shrink-0 bg-primary hover:bg-blue-700 disabled:bg-gray-400"
          size="icon"
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin text-white text-lg" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-3 text-xs text-on-surface-variant">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:underline h-auto p-0"
          onClick={() => setMessage("")}
        >
          Clear Input
        </Button>
      </div>
    </footer>
  );
}
