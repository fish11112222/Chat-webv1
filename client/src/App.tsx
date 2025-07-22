import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnhancedChatPage from "@/pages/enhanced-chat";
import SimpleAuthPage from "@/pages/simple-auth";
import { ProfilePage } from "@/pages/profile";
import { UserListPage } from "@/pages/user-list";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('chatUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to load saved user:', error);
      localStorage.removeItem('chatUser');
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('chatUser', JSON.stringify(user));
  };

  const handleSignOut = () => {
    console.log("Signing out user:", currentUser?.firstName, currentUser?.lastName, "ID:", currentUser?.id);
    setCurrentUser(null);
    localStorage.clear(); // Clear all localStorage data to prevent any conflicts
  };

  // Show loading while checking for saved session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <SimpleAuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <EnhancedChatPage currentUser={currentUser} onSignOut={handleSignOut} />} />
      <Route path="/chat" component={() => <EnhancedChatPage currentUser={currentUser} onSignOut={handleSignOut} />} />
      <Route path="/profile" component={() => <ProfilePage currentUser={currentUser} onSignOut={handleSignOut} />} />
      <Route path="/profile/:id" component={() => <ProfilePage currentUser={currentUser} onSignOut={handleSignOut} />} />
      <Route path="/users" component={() => <UserListPage currentUser={currentUser} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
