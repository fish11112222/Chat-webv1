import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnhancedChatPage from "@/pages/enhanced-chat";
import SimpleAuthPage from "@/pages/simple-auth";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <SimpleAuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <EnhancedChatPage currentUser={currentUser} onSignOut={handleSignOut} />} />
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
