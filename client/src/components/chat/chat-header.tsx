import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  currentUser: {
    id: number;
    username: string;
    initials: string;
  };
  onlineUsers: number;
  onSignOut: () => void;
}

export default function ChatHeader({ currentUser, onlineUsers, onSignOut }: ChatHeaderProps) {
  return (
    <header className="bg-primary text-white px-6 py-4 shadow-material-2 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="fas fa-comments text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-medium">Public Chat Room</h1>
            <p className="text-blue-100 text-sm">
              <span>{onlineUsers}</span> users online
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-full px-3 py-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{currentUser.initials}</span>
            </div>
            <span className="text-sm font-medium">{currentUser.username}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white hover:text-white"
            onClick={onSignOut}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
