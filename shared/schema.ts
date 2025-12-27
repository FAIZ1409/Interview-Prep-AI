import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { conversations } from "./models/chat";

export * from "./models/auth";
export * from "./models/chat";

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // SDE, Backend, Full Stack, AI/ML
  type: text("type").notNull(), // Technical, Behavioral, System Design
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  conversationId: integer("conversation_id").references(() => conversations.id),
  score: integer("score"),
  feedback: jsonb("feedback"), // { strengths: [], weaknesses: [], tips: [] }
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  content: text("content").notNull(),
  skills: jsonb("skills"), // string[]
  score: integer("score"),
  feedback: jsonb("feedback"), // { strengths: [], weaknesses: [], summary: "" }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({ 
  id: true, 
  createdAt: true,
  userId: true, // Set from session
  score: true,
  feedback: true
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  userId: true
});

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type InterviewFeedback = {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  roadmap: string[];
};
