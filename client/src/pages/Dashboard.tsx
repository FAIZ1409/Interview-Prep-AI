import { useAuth } from "@/hooks/use-auth";
import { useInterviews } from "@/hooks/use-interviews";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: interviews, isLoading } = useInterviews();

  // Mock data for charts if no interviews yet
  const chartData = interviews?.map((i) => ({
    name: new Date(i.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: i.score || 0
  })) || [
    { name: 'Jan 1', score: 65 },
    { name: 'Jan 5', score: 72 },
    { name: 'Jan 10', score: 68 },
    { name: 'Jan 15', score: 85 },
    { name: 'Jan 20', score: 82 },
    { name: 'Jan 25', score: 91 },
  ];

  if (isLoading) return null; // Or loading skeleton

  const completedCount = interviews?.filter(i => i.status === 'completed').length || 0;
  const inProgressCount = interviews?.filter(i => i.status === 'in_progress').length || 0;
  const avgScore = completedCount > 0 
    ? Math.round((interviews?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0) / completedCount) 
    : 0;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-1">Ready to ace your next interview?</p>
        </div>
        <Link href="/practice">
          <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Average Score</p>
              <h3 className="text-2xl font-bold">{avgScore}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
              <h3 className="text-2xl font-bold">{completedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">In Progress</p>
              <h3 className="text-2xl font-bold">{inProgressCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviews?.slice(0, 4).map((interview) => (
              <Link key={interview.id} href={`/practice/${interview.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{interview.role}</span>
                    <span className="text-xs text-muted-foreground capitalize">{interview.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      interview.status === 'completed' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-orange-500/10 text-orange-600'
                    }`}>
                      {interview.status === 'completed' ? 'Done' : 'Active'}
                    </span>
                    {interview.score && (
                      <span className="font-bold text-primary">{interview.score}%</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {(!interviews || interviews.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No interviews yet. Start your first one!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
