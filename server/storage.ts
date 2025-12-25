import { db } from "./db";
import {
  interviews,
  resumes,
  type InsertInterview,
  type InsertResume,
  type Interview,
  type Resume,
  type User
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Interviews
  createInterview(userId: string, interview: InsertInterview): Promise<Interview>;
  getInterviews(userId: string): Promise<Interview[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, updates: Partial<Interview>): Promise<Interview>;
  
  // Resumes
  createResume(userId: string, resume: InsertResume): Promise<Resume>;
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  updateResume(id: number, updates: Partial<Resume>): Promise<Resume>;
}

export class DatabaseStorage implements IStorage {
  // Interviews
  async createInterview(userId: string, interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews)
      .values({ ...interview, userId })
      .returning();
    return newInterview;
  }

  async getInterviews(userId: string): Promise<Interview[]> {
    return await db.select()
      .from(interviews)
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviews.createdAt));
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async updateInterview(id: number, updates: Partial<Interview>): Promise<Interview> {
    const [updated] = await db.update(interviews)
      .set(updates)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  // Resumes
  async createResume(userId: string, resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes)
      .values({ ...resume, userId })
      .returning();
    return newResume;
  }

  async getResumes(userId: string): Promise<Resume[]> {
    return await db.select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async updateResume(id: number, updates: Partial<Resume>): Promise<Resume> {
    const [updated] = await db.update(resumes)
      .set(updates)
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
