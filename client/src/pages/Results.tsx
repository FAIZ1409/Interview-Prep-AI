import { useInterview } from "@/hooks/use-interviews";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertCircle, Award, BookOpen, MessageSquare, ArrowLeft } from "lucide-react";

export default function Results() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: interview, isLoading } = useInterview(Number(id));

  if (isLoading) return null;
  if (!interview || !interview.feedback) return <div>No feedback available yet.</div>;

  const feedback = interview.feedback as any;
  const score = interview.score || 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/practice")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Interview Analysis</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <CardTitle>Job Readiness</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * score) / 100}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">{score}%</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {score >= 80 ? "Highly Capable" : score >= 60 ? "Ready with minor improvements" : "Needs more preparation"}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Linguistic & Soft Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Fluency & Slang</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {feedback.languageFluency || "No data available."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><Award className="w-4 h-4" /> Attitude & Confidence</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {feedback.attitude || "No data available."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {feedback.questionAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedback.questionAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="question" hide />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-muted-foreground mt-2">Individual Question Performance (0-100)</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-green-500">•</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" /> Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-red-500">•</span> {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Learning Roadmap & Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {feedback.roadmap?.map((r: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Expert Tips</h4>
                <ul className="space-y-1">
                  {feedback.tips?.map((t: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground italic">
                      "{t}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
