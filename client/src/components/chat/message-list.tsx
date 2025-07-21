import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MessageItem from "./message-item";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
  currentUser: {
    id: number;
    username: string;
    initials: string;
  };
  isLoading: boolean;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (message: Message) => void;
}

export default function MessageList({
  messages,
  currentUser,
  isLoading,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 max-w-xs md:max-w-md">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex items-center space-x-2 mt-1 px-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex justify-center">
          <div className="bg-gray-100 text-on-surface-variant px-4 py-2 rounded-full text-sm">
            <i className="fas fa-info-circle mr-1"></i>
            Welcome to the public chat room! Start the conversation.
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUser={currentUser}
            onEdit={() => onEditMessage(message)}
            onDelete={() => onDeleteMessage(message)}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
