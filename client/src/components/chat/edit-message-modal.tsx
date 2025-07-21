import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@shared/schema";

interface EditMessageModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  isLoading: boolean;
}

export default function EditMessageModal({
  message,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: EditMessageModalProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (message) {
      setContent(message.content);
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSave(content.trim());
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 500;
  const canSave = content.trim() && !isLoading && !isOverLimit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl shadow-material-3 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-lg font-medium text-on-surface">
            Edit Message
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm leading-relaxed"
            rows={4}
            maxLength={500}
            placeholder="Edit your message..."
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-on-surface-variant'}`}>
              <span>{charCount}</span>/500 characters
            </span>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSave}
                className="bg-primary text-white hover:bg-blue-700"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
