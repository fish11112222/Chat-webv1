import { users, messages, chatThemes, chatSettings, type User, type SignUpData, type SignInData, type Message, type InsertMessage, type UpdateMessage, type ChatTheme, type ChatSettings } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentTheme: ChatTheme;
  private themes: Map<number, ChatTheme>;
  private userActivity: Map<number, Date>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;

    // Initialize default themes
    this.themes = new Map();
    this.initializeThemes();
    this.currentTheme = this.themes.get(1)!; // Default to first theme
    this.userActivity = new Map();
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
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(signUpData: SignUpData): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...signUpData, 
      id, 
      avatar: null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(credentials: SignInData): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) {
      console.log("User not found:", credentials.email);
      return null;
    }

    // For development, we're using plain text password comparison
    // In production, you should use proper password hashing
    if (user.password !== credentials.password) {
      console.log("Password mismatch for user:", credentials.email);
      console.log("Stored password:", user.password);
      console.log("Provided password:", credentials.password);
      return null;
    }

    console.log("Authentication successful for user:", user.email);
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: now,
      updatedAt: null,
      attachmentUrl: insertMessage.attachmentUrl || null,
      attachmentType: insertMessage.attachmentType || null,
      attachmentName: insertMessage.attachmentName || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, userId: number, updates: UpdateMessage): Promise<Message | null> {
    const message = this.messages.get(id);
    if (!message || message.userId !== userId) {
      return null;
    }

    const updatedMessage: Message = {
      ...message,
      ...updates,
      updatedAt: new Date(),
    };

    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: number, userId: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message || message.userId !== userId) {
      return false;
    }

    return this.messages.delete(id);
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
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
    return this.users.size;
  }

  async getOnlineUsers(): Promise<User[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers: User[] = [];

    for (const [userId, lastActive] of this.userActivity.entries()) {
      if (lastActive > fiveMinutesAgo) {
        const user = this.users.get(userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          onlineUsers.push(userWithoutPassword as User);
        }
      }
    }

    return onlineUsers;
  }

  async updateUserActivity(userId: number): Promise<void> {
    this.userActivity.set(userId, new Date());
  }
}

export const storage = new MemStorage();