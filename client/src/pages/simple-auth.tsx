import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@shared/schema";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export default function SimpleAuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: typeof signUpData) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (user: User) => {
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Account created!",
        description: "Welcome to the chat room!",
      });
      onAuthSuccess(user);
    },
    onError: (error: any) => {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: typeof signInData) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (user: User) => {
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Welcome back!",
        description: `Hello, ${user.firstName}!`,
      });
      onAuthSuccess(user);
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.username || !signUpData.email || !signUpData.password) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    signUpMutation.mutate(signUpData);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    signInMutation.mutate(signInData);
  };

  const isLoading = signUpMutation.isPending || signInMutation.isPending;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser) as User;
                onAuthSuccess(user);
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
                localStorage.removeItem("user");
            }
        }
    }, [onAuthSuccess]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-comments text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Public Chat Room</h1>
          <p className="text-on-surface-variant">Connect and chat with people around the world</p>
        </div>

        <Card className="shadow-material-2">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Join our community and start chatting" 
                : "Welcome back to the chat room"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSignUp ? (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium leading-none">First Name</label>
                    <Input 
                      placeholder="John" 
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none">Last Name</label>
                    <Input 
                      placeholder="Doe" 
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none">Username</label>
                  <Input 
                    placeholder="johndoe" 
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({...signUpData, username: e.target.value})}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none">Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={signInData.email}
                    onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none">Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={signInData.password}
                    onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-on-surface-variant">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </p>
              <Button
                variant="ghost"
                className="mt-1 text-primary"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}