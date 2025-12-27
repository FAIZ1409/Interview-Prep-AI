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
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI for custom analysis
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

  // Interview Analysis (Voice/Text)
  app.post(api.interviews.analyze.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { text } = api.interviews.analyze.input.parse(req.body);
      
      // Analyze text for confidence, clarity, filler words
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `Analyze the following interview response. 
            Return a JSON object with:
            - confidence (0-100 score based on language certainty)
            - clarity (0-100 score)
            - fillerWords (array of detected filler words like um, uh, like)
            - feedback (brief qualitative feedback)
            - tips (array of 2-3 specific improvements)`
          },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      res.status(500).json({ message: "Failed to analyze response" });
    }
  });

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

  app.post(api.interviews.complete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const interviewId = Number(req.params.id);
    
    try {
      const interview = await storage.getInterview(interviewId);
      if (!interview) return res.status(404).json({ message: "Interview not found" });
      
      if (!interview.conversationId) {
        return res.status(400).json({ message: "No conversation linked to interview" });
      }

      // Fetch full transcript
      const messages = await chatStorage.getMessagesByConversation(interview.conversationId);
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");

      // Analyze full interview
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `You are an expert interviewer. Analyze this full interview transcript.
            Return a JSON object with:
            - score (0-100)
            - feedback (object with:
              - strengths (array of strings)
              - weaknesses (array of strings)
              - tips (array of strings)
              - roadmap (array of strings for future learning)
              - summary (string)
            )`
          },
          { role: "user", content: transcript }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      
      const updated = await storage.updateInterview(interviewId, {
        status: "completed",
        score: result.score || 0,
        feedback: result.feedback || {}
      });

      res.json(updated);
    } catch (err) {
      console.error("Interview completion failed:", err);
      res.status(500).json({ message: "Failed to complete interview" });
    }
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
    
    // Analyze resume with AI
    let score = 0;
    let feedback = {};
    let skills: string[] = [];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `Analyze this resume. 
            Return a JSON object with:
            - score (0-100)
            - skills (array of extracted technical skills)
            - feedback (object with 'strengths', 'weaknesses', 'summary')`
          },
          { role: "user", content: content.slice(0, 10000) } // Limit context
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(completion.choices[0].message.content || "{}");
      score = result.score || 0;
      feedback = result.feedback || {};
      skills = result.skills || [];
    } catch (err) {
      console.error("Resume analysis failed:", err);
      // Fallback if AI fails
      skills = ["Extracted"]; 
    }

    const resume = await storage.createResume(userId, {
      fileName: req.file.originalname,
      content: content.slice(0, 5000), // Limit size
      skills,
      score,
      feedback
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
