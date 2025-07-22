import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, updateMessageSchema, signUpSchema, signInSchema, chatThemes, chatSettings } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const validatedData = signInSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to sign in" });
      }
    }
  });

  // Get users count (must be before the parameterized route)
  app.get("/api/users/count", async (req, res) => {
    try {
      const count = await storage.getUsersCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching users count:", error);
      res.status(500).json({ message: "Failed to fetch users count" });
    }
  });

  // Get total registered users count
  app.get("/api/users/total", async (req, res) => {
    try {
      const count = await storage.getTotalUsersCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching total users count:", error);
      res.status(500).json({ message: "Failed to fetch total users count" });
    }
  });

  // Get all registered users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get online users list (must be before the parameterized route)
  app.get("/api/users/online", async (req, res) => {
    try {
      const users = await storage.getOnlineUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  // Update a message
  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { userId, ...updateData } = req.body;
      
      if (!userId) {
        console.log("Update request without userId for message:", messageId);
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Get the message first to check ownership
      const message = await storage.getMessageById(messageId);
      if (!message) {
        console.log("Message not found for update:", messageId);
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if the user owns this message
      if (message.userId !== userId) {
        console.log(`Unauthorized update attempt: User ${userId} tried to update message ${messageId} owned by user ${message.userId}`);
        return res.status(403).json({ message: "You can only edit your own messages" });
      }
      
      const validatedData = updateMessageSchema.parse(updateData);
      console.log(`User ${userId} updating their message ${messageId}`);
      const updatedMessage = await storage.updateMessage(messageId, userId, validatedData);
      
      if (!updatedMessage) {
        console.log("Failed to update message in storage:", messageId);
        return res.status(500).json({ message: "Failed to update message in storage" });
      }
      
      console.log(`Message ${messageId} successfully updated by user ${userId}`);
      res.json(updatedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating message:", error);
        res.status(500).json({ message: "Failed to update message" });
      }
    }
  });

  // Delete a message
  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        console.log("Delete request without userId for message:", messageId);
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Get the message first to check ownership
      const message = await storage.getMessageById(messageId);
      if (!message) {
        console.log("Message not found for deletion:", messageId);
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if the user owns this message
      if (message.userId !== userId) {
        console.log(`Unauthorized delete attempt: User ${userId} tried to delete message ${messageId} owned by user ${message.userId}`);
        return res.status(403).json({ message: "You can only delete your own messages" });
      }
      
      console.log(`User ${userId} deleting their message ${messageId}`);
      const deleted = await storage.deleteMessage(messageId, userId);
      
      if (!deleted) {
        console.log("Failed to delete message from storage:", messageId);
        return res.status(500).json({ message: "Failed to delete message from storage" });
      }
      
      console.log(`Message ${messageId} successfully deleted by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  

  // Update user activity (heartbeat)
  app.post("/api/users/:id/activity", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.updateUserActivity(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user activity:", error);
      res.status(500).json({ message: "Failed to update user activity" });
    }
  });

  // Get current theme
  app.get("/api/chat/theme", async (req, res) => {
    try {
      const theme = await storage.getActiveTheme();
      res.json(theme);
    } catch (error) {
      console.error("Error fetching theme:", error);
      res.status(500).json({ message: "Failed to fetch theme" });
    }
  });

  // Change theme
  app.post("/api/chat/theme", async (req, res) => {
    try {
      const { themeId } = req.body;
      
      if (!themeId || typeof themeId !== 'number') {
        return res.status(400).json({ message: "Theme ID is required and must be a number" });
      }
      
      const theme = await storage.setActiveTheme(themeId);
      res.json(theme);
    } catch (error) {
      console.error("Error changing theme:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to change theme" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
