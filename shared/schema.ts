import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  dateOfBirth: timestamp("date_of_birth"),
  isOnline: boolean("is_online").default(false),
  lastActivity: timestamp("last_activity", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  username: text("username").notNull(),
  userId: integer("user_id").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"), // 'image', 'file', 'gif'
  attachmentName: text("attachment_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Chat themes table
export const chatThemes = pgTable("chat_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  backgroundColor: text("background_color").notNull(),
  messageBackgroundSelf: text("message_background_self").notNull(),
  messageBackgroundOther: text("message_background_other").notNull(),
  textColor: text("text_color").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table for global chat settings
export const chatSettings = pgTable("chat_settings", {
  id: serial("id").primaryKey(),
  activeThemeId: integer("active_theme_id").references(() => chatThemes.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auth schemas
export const signUpSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(50, "First name cannot exceed 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name cannot exceed 50 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Message schemas
export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  username: true,
  userId: true,
  attachmentUrl: true,
  attachmentType: true,
  attachmentName: true,
}).extend({
  content: z.string().min(1, "Message cannot be empty").max(500, "Message cannot exceed 500 characters"),
  username: z.string().min(1, "Username is required"),
  userId: z.number().min(1, "User ID is required"),
  attachmentUrl: z.string().optional(),
  attachmentType: z.enum(['image', 'file', 'gif']).optional(),
  attachmentName: z.string().optional(),
});

export const updateMessageSchema = createInsertSchema(messages).pick({
  content: true,
}).extend({
  content: z.string().min(1, "Message cannot be empty").max(500, "Message cannot exceed 500 characters"),
});

// Profile schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "ชื่อจริงไม่สามารถว่างได้").max(50, "ชื่อจริงยาวเกินไป").optional(),
  lastName: z.string().min(1, "นามสกุลไม่สามารถว่างได้").max(50, "นามสกุลยาวเกินไป").optional(),
  bio: z.string().max(500, "ประวัติส่วนตัวยาวเกินไป").optional(),
  location: z.string().max(100, "ที่อยู่ยาวเกินไป").optional(),
  website: z.string().url("ลิงก์เว็บไซต์ไม่ถูกต้อง").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  avatar: z.string().optional(),
});

// Types
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type UpdateMessage = z.infer<typeof updateMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type ChatTheme = typeof chatThemes.$inferSelect;
export type ChatSettings = typeof chatSettings.$inferSelect;
