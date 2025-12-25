import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { storage } from "./storage";
import { chatStorage } from "./replit_integrations/chat/storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === App Routes ===

  // Interviews
  app.get(api.interviews.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const items = await storage.getInterviews(userId);
    res.json(items);
  });

  app.get(api.interviews.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const interview = await storage.getInterview(Number(req.params.id));
    if (!interview) return res.sendStatus(404);
    res.json(interview);
  });

  app.post(api.interviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    try {
      const input = api.interviews.create.input.parse(req.body);
      
      // Create a chat conversation for this interview
      const conversation = await chatStorage.createConversation(`Interview: ${input.role} (${input.type})`);
      
      // Create interview linked to conversation
      const interview = await storage.createInterview(userId, {
        ...input,
        conversationId: conversation.id
      });
      
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resumes
  app.post(api.resumes.upload.path, upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    // In a real app, parse PDF content here. For now, we'll store mock content.
    // We could use pdf-parse package if needed, but for MVP we might mock or just store text if user sends it.
    // Assuming file content is text for simple MVP or handle PDF parsing later.
    
    const content = req.file.buffer.toString('utf-8'); // Naive text extraction
    
    const resume = await storage.createResume(userId, {
      fileName: req.file.originalname,
      content: content.slice(0, 5000), // Limit size
      skills: ["Java", "Python"] // Mock skills for now
    });
    
    res.status(201).json(resume);
  });
  
  app.get(api.resumes.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const items = await storage.getResumes(userId);
    res.json(items);
  });

  return httpServer;
}
