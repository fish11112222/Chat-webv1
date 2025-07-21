import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface MessageItemProps {
  message: Message;
  currentUser: {
    id: number;
    username: string;
    initials: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function MessageItem({ message, currentUser, onEdit, onDelete }: MessageItemProps) {
  const isCurrentUser = message.userId === currentUser.id;
  const messageTime = format(new Date(message.createdAt), "h:mm a");
  const isEdited = !!message.updatedAt;

  // Generate initials from username
  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color for each user based on their username
  const getUserColor = (username: string) => {
    const colors = [
      "bg-purple-500",
      "bg-orange-500", 
      "bg-green-500",
      "bg-blue-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500"
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={cn(
      "flex items-start space-x-3",
      isCurrentUser && "justify-end"
    )}>
      {!isCurrentUser && (
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          getUserColor(message.username)
        )}>
          <span className="text-white text-sm font-medium">
            {getInitials(message.username)}
          </span>
        </div>
      )}
      
      <div className="flex-1 max-w-xs md:max-w-md">
        <div className={cn(
          "px-4 py-3 shadow-material-1",
          isCurrentUser 
            ? "bg-primary text-white rounded-2xl rounded-tr-md ml-auto"
            : "bg-secondary rounded-2xl rounded-tl-md"
        )}>
          <p className={cn(
            "text-sm leading-relaxed",
            isCurrentUser ? "text-white" : "text-on-surface"
          )}>
            {message.content}
          </p>
        </div>
        
        <div className={cn(
          "flex items-center justify-between mt-1 px-2",
          isCurrentUser && "justify-end"
        )}>
          <div className={cn(
            "flex items-center space-x-2",
            isCurrentUser && "justify-end w-full"
          )}>
            {!isCurrentUser && (
              <span className="text-xs text-on-surface-variant font-medium">
                {message.username}
              </span>
            )}
            
            {isCurrentUser && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-on-surface-variant hover:text-primary"
                  onClick={onEdit}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-on-surface-variant hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <span className="text-xs text-on-surface-variant">
              {messageTime}
              {isEdited && " (edited)"}
            </span>
            
            {isCurrentUser && (
              <i className="fas fa-check-double text-xs text-accent" title="Read" />
            )}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">
            {currentUser.initials}
          </span>
        </div>
      )}
    </div>
  );
}
