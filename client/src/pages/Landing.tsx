import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, CheckCircle2, Mic, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    { icon: BrainCircuit, title: "AI Mock Interviews", desc: "Practice with realistic AI personas for different tech roles." },
    { icon: Code2, title: "Live Code Eval", desc: "Write code in a real-time environment with instant feedback." },
    { icon: Mic, title: "Speech Analysis", desc: "Get feedback on your communication clarity and confidence." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto w-full">
        <span className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          PrepAI
        </span>
        <Button onClick={() => window.location.href = "/api/login"} className="rounded-full px-6">
          Sign In
        </Button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 md:space-y-8"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: GPT-5 Powered Interviews
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight">
            Master your next <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              technical interview
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practice coding, system design, and behavioral questions with an AI that gives you real-time feedback on your answers and delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-14 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => window.location.href = "/api/login"}
            >
              Start Practicing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 h-14 text-lg border-2 hover:bg-secondary/5"
            >
              View Demo
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full text-left">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center text-sm text-muted-foreground border-t border-border/50">
        © 2024 PrepAI. All rights reserved.
      </footer>
    </div>
  );
}
