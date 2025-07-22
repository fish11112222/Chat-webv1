
import { users, messages, chatThemes, chatSettings, type User, type SignUpData, type SignInData, type Message, type InsertMessage, type UpdateMessage, type ChatTheme, type ChatSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: SignUpData): Promise<User>;
  authenticateUser(credentials: SignInData): Promise<User | null>;

  // Message CRUD operations
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, userId: number, updates: UpdateMessage): Promise<Message | null>;
  deleteMessage(id: number, userId: number): Promise<boolean>;
  getMessageById(id: number): Promise<Message | undefined>;

  // Theme and settings operations
  getActiveTheme(): Promise<ChatTheme | undefined>;
  setActiveTheme(themeId: number): Promise<ChatTheme>;
  getUsersCount(): Promise<number>;
  getOnlineUsers(): Promise<User[]>;
  updateUserActivity(userId: number): Promise<void>;
  getTotalUsersCount(): Promise<number>;
}

export class PostgresStorage implements IStorage {
  private userActivity: Map<number, Date>;
  private currentTheme: ChatTheme;
  private themes: Map<number, ChatTheme>;

  constructor() {
    this.userActivity = new Map();
    this.themes = new Map();
    this.initializeThemes();
    this.currentTheme = this.themes.get(1)!; // Default to first theme
  }

  private initializeThemes() {
    const defaultThemes = [
      {
        id: 1,
        name: "Classic Blue",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af", 
        backgroundColor: "#f8fafc",
        messageBackgroundSelf: "#3b82f6",
        messageBackgroundOther: "#e2e8f0",
        textColor: "#1e293b",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Sunset Orange",
        primaryColor: "#f59e0b",
        secondaryColor: "#d97706",
        backgroundColor: "#fef3c7",
        messageBackgroundSelf: "#f59e0b",
        messageBackgroundOther: "#fed7aa",
        textColor: "#92400e",
        isActive: false,
        createdAt: new Date()
      },
      {
        id: 3,
        name: "Forest Green",
        primaryColor: "#10b981",
        secondaryColor: "#059669",
        backgroundColor: "#ecfdf5",
        messageBackgroundSelf: "#10b981",
        messageBackgroundOther: "#d1fae5",
        textColor: "#064e3b",
        isActive: false,
        createdAt: new Date()
      },
      {
        id: 4,
        name: "Purple Dreams",
        primaryColor: "#8b5cf6",
        secondaryColor: "#7c3aed",
        backgroundColor: "#f3f4f6",
        messageBackgroundSelf: "#8b5cf6",
        messageBackgroundOther: "#e5e7eb",
        textColor: "#374151",
        isActive: false,
        createdAt: new Date()
      },
      {
        id: 5,
        name: "Rose Gold",
        primaryColor: "#f43f5e",
        secondaryColor: "#e11d48",
        backgroundColor: "#fdf2f8",
        messageBackgroundSelf: "#f43f5e",
        messageBackgroundOther: "#fce7f3",
        textColor: "#881337",
        isActive: false,
        createdAt: new Date()
      },
      {
        id: 6,
        name: "Dark Mode",
        primaryColor: "#6366f1",
        secondaryColor: "#4f46e5",
        backgroundColor: "#111827",
        messageBackgroundSelf: "#6366f1",
        messageBackgroundOther: "#374151",
        textColor: "#f9fafb",
        isActive: false,
        createdAt: new Date()
      }
    ];

    defaultThemes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async createUser(signUpData: SignUpData): Promise<User> {
    try {
      const result = await db.insert(users).values({
        ...signUpData,
        avatar: null,
        lastActivity: null,
      }).returning();
      
      console.log("User created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async authenticateUser(credentials: SignInData): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        console.log("User not found:", credentials.email);
        return null;
      }

      // For development, we're using plain text password comparison
      // In production, you should use proper password hashing
      if (user.password !== credentials.password) {
        console.log("Password mismatch for user:", credentials.email);
        return null;
      }

      console.log("Authentication successful for user:", user.email);
      return user;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const result = await db.select().from(messages).orderBy(messages.createdAt);
      return result;
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const result = await db.insert(messages).values({
        ...insertMessage,
        attachmentUrl: insertMessage.attachmentUrl || null,
        attachmentType: insertMessage.attachmentType || null,
        attachmentName: insertMessage.attachmentName || null,
        updatedAt: null,
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async updateMessage(id: number, userId: number, updates: UpdateMessage): Promise<Message | null> {
    try {
      const result = await db.update(messages)
        .set({ 
          ...updates, 
          updatedAt: new Date() 
        })
        .where(eq(messages.id, id) && eq(messages.userId, userId))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error("Error updating message:", error);
      return null;
    }
  }

  async deleteMessage(id: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(messages)
        .where(eq(messages.id, id) && eq(messages.userId, userId))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    try {
      const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting message by id:", error);
      return undefined;
    }
  }

  async getActiveTheme(): Promise<ChatTheme | undefined> {
    return this.currentTheme;
  }

  async setActiveTheme(themeId: number): Promise<ChatTheme> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme with ID ${themeId} not found`);
    }
    this.currentTheme = theme;
    return theme;
  }

  async getUsersCount(): Promise<number> {
    try {
      // Count active registered users from database
      const allUsers = await db.select().from(users);
      
      let activeRegisteredUsers = 0;
      allUsers.forEach(user => {
        if (this.isUserActive(user.id)) {
          activeRegisteredUsers++;
        }
      });

      return activeRegisteredUsers;
    } catch (error) {
      console.error("Error getting users count:", error);
      return 0;
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users);
      
      return allUsers.map(user => {
        const lastActive = this.userActivity.get(user.id);
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...userWithoutPassword,
          lastActivity: lastActive || null
        };
      });
    } catch (error) {
      console.error("Error getting online users:", error);
      return [];
    }
  }

  private isUserActive(userId: number): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastActive = this.userActivity.get(userId);
    return !lastActive || lastActive > fiveMinutesAgo;
  }

  async updateUserActivity(userId: number): Promise<void> {
    this.userActivity.set(userId, new Date());
    
    // Also update in database
    try {
      await db.update(users)
        .set({ lastActivity: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user activity in database:", error);
    }
  }

  async getTotalUsersCount(): Promise<number> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers.length;
    } catch (error) {
      console.error("Error getting total users count:", error);
      return 0;
    }
  }
}

export const storage = new PostgresStorage();
