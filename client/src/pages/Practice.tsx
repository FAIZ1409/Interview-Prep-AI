import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreateInterview, useInterviews } from "@/hooks/use-interviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, MessagesSquare, Play, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function Practice() {
  const { data: interviews } = useInterviews();
  const createInterview = useCreateInterview();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState("SDE");
  const [type, setType] = useState("Technical");
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    try {
      const interview = await createInterview.mutateAsync({
        role,
        type,
        status: "in_progress"
      });
      setLocation(`/practice/${interview.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Practice History</h1>
          <p className="text-muted-foreground mt-1">Review your past sessions or start a new one.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20">
              <Play className="w-4 h-4 mr-2" /> Start New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SDE">Software Engineer</SelectItem>
                    <SelectItem value="Frontend">Frontend Developer</SelectItem>
                    <SelectItem value="Backend">Backend Developer</SelectItem>
                    <SelectItem value="Full Stack">Full Stack Developer</SelectItem>
                    <SelectItem value="AI/ML">AI/ML Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical Coding</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="System Design">System Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={createInterview.isPending}
                className="w-full mt-4"
              >
                {createInterview.isPending ? "Creating..." : "Start Interview"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {interviews?.map((interview) => (
          <Card key={interview.id} className="hover:border-primary/50 transition-colors duration-200 cursor-pointer" onClick={() => setLocation(`/practice/${interview.id}`)}>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${
                  interview.type === 'Technical' ? 'bg-blue-500/10 text-blue-500' :
                  interview.type === 'Behavioral' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-teal-500/10 text-teal-500'
                }`}>
                  {interview.type === 'Technical' ? <Code2 className="w-6 h-6" /> : <MessagesSquare className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{interview.role} Interview</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(interview.createdAt!), "MMM d, yyyy")}
                    </span>
                    <span className="capitalize">{interview.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {interview.status === "completed" ? (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold text-primary">{interview.score}%</p>
                  </div>
                ) : (
                  <Button variant="outline" className="rounded-full">Continue</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
