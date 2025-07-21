import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatTheme } from "@shared/schema";

// Predefined themes
const defaultThemes = [
  {
    id: 1,
    name: "Classic Blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af", 
    backgroundColor: "#f8fafc",
    messageBackgroundSelf: "#3b82f6",
    messageBackgroundOther: "#e2e8f0",
    textColor: "#1e293b"
  },
  {
    id: 2,
    name: "Sunset Orange",
    primaryColor: "#f59e0b",
    secondaryColor: "#d97706",
    backgroundColor: "#fef3c7",
    messageBackgroundSelf: "#f59e0b",
    messageBackgroundOther: "#fed7aa",
    textColor: "#92400e"
  },
  {
    id: 3,
    name: "Forest Green",
    primaryColor: "#10b981",
    secondaryColor: "#059669",
    backgroundColor: "#ecfdf5",
    messageBackgroundSelf: "#10b981",
    messageBackgroundOther: "#d1fae5",
    textColor: "#064e3b"
  },
  {
    id: 4,
    name: "Purple Dreams",
    primaryColor: "#8b5cf6",
    secondaryColor: "#7c3aed",
    backgroundColor: "#f3f4f6",
    messageBackgroundSelf: "#8b5cf6",
    messageBackgroundOther: "#e5e7eb",
    textColor: "#374151"
  },
  {
    id: 5,
    name: "Rose Gold",
    primaryColor: "#f43f5e",
    secondaryColor: "#e11d48",
    backgroundColor: "#fdf2f8",
    messageBackgroundSelf: "#f43f5e",
    messageBackgroundOther: "#fce7f3",
    textColor: "#881337"
  },
  {
    id: 6,
    name: "Dark Mode",
    primaryColor: "#6366f1",
    secondaryColor: "#4f46e5",
    backgroundColor: "#111827",
    messageBackgroundSelf: "#6366f1",
    messageBackgroundOther: "#374151",
    textColor: "#f9fafb"
  }
];

interface ThemeSelectorProps {
  currentTheme?: ChatTheme;
  onThemeChange?: (theme: ChatTheme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current active theme
  const { data: activeTheme } = useQuery<ChatTheme>({
    queryKey: ['/api/chat/theme'],
    retry: false,
  });

  // Change theme mutation  
  const changeThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      const response = await apiRequest("POST", "/api/chat/theme", { themeId });
      return response.json();
    },
    onSuccess: (theme) => {
      toast({
        title: "Theme changed!",
        description: `Switched to ${theme.name} theme`,
      });
      
      // Apply theme immediately to CSS variables
      applyThemeToCSS(theme);
      
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/chat/theme'] });
      
      if (onThemeChange) {
        onThemeChange(theme);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to change theme",
        description: error.message || "Could not change theme",
        variant: "destructive",
      });
    },
  });

  const applyThemeToCSS = (theme: ChatTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--chat-primary', theme.primaryColor);
    root.style.setProperty('--chat-secondary', theme.secondaryColor);
    root.style.setProperty('--chat-background', theme.backgroundColor);
    root.style.setProperty('--chat-message-self', theme.messageBackgroundSelf);
    root.style.setProperty('--chat-message-other', theme.messageBackgroundOther);
    root.style.setProperty('--chat-text', theme.textColor);
    
    // Update body background
    document.body.style.backgroundColor = theme.backgroundColor;
  };

  const handleThemeSelect = (theme: typeof defaultThemes[0]) => {
    changeThemeMutation.mutate(theme.id);
  };

  const currentActiveThemeId = activeTheme?.id || currentTheme?.id || 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
          <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="ml-1 text-xs hidden sm:inline">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-center">Choose Chat Theme</h3>
          <p className="text-xs text-gray-500 text-center">Everyone will see the new theme</p>
          
          <div className="grid grid-cols-2 gap-3">
            {defaultThemes.map((theme) => (
              <div
                key={theme.id}
                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                  currentActiveThemeId === theme.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeSelect(theme)}
              >
                {currentActiveThemeId === theme.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="font-medium text-sm">{theme.name}</div>
                  
                  {/* Theme preview */}
                  <div 
                    className="h-16 rounded p-2 text-xs"
                    style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                  >
                    <div 
                      className="inline-block px-2 py-1 rounded mb-1 text-white text-[10px]"
                      style={{ backgroundColor: theme.messageBackgroundSelf }}
                    >
                      Your message
                    </div>
                    <div 
                      className="inline-block px-2 py-1 rounded text-[10px] ml-2"
                      style={{ 
                        backgroundColor: theme.messageBackgroundOther, 
                        color: theme.textColor 
                      }}
                    >
                      Other message
                    </div>
                  </div>
                  
                  {/* Color palette */}
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {changeThemeMutation.isPending && (
            <div className="text-center text-sm text-gray-500">
              Changing theme...
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}