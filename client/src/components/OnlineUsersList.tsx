
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Circle } from "lucide-react";
import { format } from "date-fns";

interface OnlineUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  isOnline?: boolean;
  lastActivity?: string;
  createdAt: Date | string;
}

interface OnlineUsersListProps {
  usersCount: number;
}

export default function OnlineUsersList({ usersCount }: OnlineUsersListProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get all registered users
  const { data: allUsers = [] } = useQuery<OnlineUser[]>({
    queryKey: ["/api/users/online"],
    refetchInterval: 10000, // Update every 10 seconds
    enabled: isOpen, // Only fetch when popover is open
  });

  // Get total users count from API
  const { data: totalUsersData } = useQuery({
    queryKey: ["/api/users/total"],
    refetchInterval: 10000,
    enabled: isOpen,
  });

  const totalRegisteredUsers = allUsers.length;

  // Check activity status - users are active if they have recent activity or no activity tracking
  const activeUsers = allUsers.filter(user => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
    return !lastActivity || lastActivity > fiveMinutesAgo;
  });

  const inactiveUsers = allUsers.filter(user => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
    return lastActivity && lastActivity <= fiveMinutesAgo;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getLastSeenText = (lastActivity?: string) => {
    if (!lastActivity) return "Just now";
    
    const now = new Date();
    const lastSeen = new Date(lastActivity);
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(lastSeen, "MMM d");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-2">
          <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 transition-colors">
            <Users className="w-3 h-3" />
            {totalRegisteredUsers} users ({activeUsers.length} active)
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registered Users ({totalRegisteredUsers})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {/* Active Users */}
              {activeUsers.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    Active ({activeUsers.length})
                  </div>
                  <div className="space-y-2">
                    {activeUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-500 text-white">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Active
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Users */}
              {inactiveUsers.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                    Inactive ({inactiveUsers.length})
                  </div>
                  <div className="space-y-2">
                    {inactiveUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gray-400 text-white">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-gray-600">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            @{user.username}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {getLastSeenText(user.lastActivity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allUsers.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">No registered users found</div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
