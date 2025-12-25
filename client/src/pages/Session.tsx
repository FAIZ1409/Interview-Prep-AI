import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useInterview, useCompleteInterview } from "@/hooks/use-interviews";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Code, MessageSquare, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Session() {
  const { id } = useParams();
  const interviewId = Number(id);
  const { data: interview } = useInterview(interviewId);
  const { messages, sendMessage, isStreaming, currentStream } = useChatStream(interview?.conversationId || undefined);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n  \n}");
  const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStream]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!interview) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-base">{interview.role} Interview</h1>
            <p className="text-xs text-muted-foreground capitalize">{interview.type} • {interview.status === 'in_progress' ? 'Live' : 'Completed'}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" className="hidden md:flex">Exit</Button>
           <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none">End Session</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Chat Area - Always visible on desktop, tabbed on mobile */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
             {messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <MessageSquare className="w-8 h-8 opacity-50" />
                 </div>
                 <p>The AI interviewer is ready.</p>
                 <p className="text-sm">Say "Hello" to start.</p>
               </div>
             )}
             
             {messages.map((msg, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-primary text-primary-foreground rounded-tr-none' 
                     : 'bg-card border border-border/50 rounded-tl-none'
                 }`}>
                   {msg.content}
                 </div>
               </motion.div>
             ))}

             {isStreaming && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none px-5 py-3.5 bg-card border border-border/50 text-sm leading-relaxed shadow-sm">
                    {currentStream}
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary align-middle animate-pulse"/>
                  </div>
                </motion.div>
             )}
          </div>

          <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your answer..."
                className="pr-24 min-h-[60px] resize-none rounded-xl border-border focus:ring-primary/20 shadow-sm"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                 <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                   <Mic className="w-4 h-4" />
                 </Button>
                 <Button size="icon" onClick={handleSend} disabled={!input.trim() || isStreaming} className="h-8 w-8 rounded-lg shadow-sm">
                   <Send className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor - Hidden on mobile unless tabbed */}
        <div className={`flex-1 flex-col border-l border-border/50 bg-[#1e1e1e] ${activeTab === 'code' ? 'flex' : 'hidden md:flex'}`}>
          <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex items-center px-4 text-xs text-gray-400">
             main.js
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-[#1e1e1e] text-gray-300 font-mono p-4 text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden h-12 border-t border-border flex">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium ${activeTab === 'chat' ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <div className="w-px bg-border" />
        <button 
          onClick={() => setActiveTab("code")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium ${activeTab === 'code' ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
        >
          <Code className="w-4 h-4" /> Code
        </button>
      </div>
    </div>
  );
}
