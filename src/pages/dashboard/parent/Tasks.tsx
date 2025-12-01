import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentData } from "@/hooks/useParentData";
import { useTaskData } from "@/hooks/useTaskData";
import { CheckCircle, Clock, Plus, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TasksPage() {
    const { data: parentData, isLoading: isLoadingParent } = useParentData();
    const [selectedChildId, setSelectedChildId] = useState<string>("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Auto-select first child
    if (parentData?.children?.length && !selectedChildId) {
        setSelectedChildId(parentData.children[0].id);
    }

    const { tasks, completions, isLoading, createTask, approveCompletion } = useTaskData(selectedChildId);

    if (isLoadingParent || (selectedChildId && isLoading)) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tasks & Rewards</h1>
                    <p className="text-muted-foreground">Manage chores and educational tasks for bonus screen time</p>
                </div>

                <div className="flex gap-4">
                    {parentData?.children && parentData.children.length > 0 && (
                        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select child" />
                            </SelectTrigger>
                            <SelectContent>
                                {parentData.children.map((child) => (
                                    <SelectItem key={child.id} value={child.id}>
                                        {child.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Task</DialogTitle>
                                <DialogDescription>Add a new chore or educational activity.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Task Title</Label>
                                    <Input id="title" placeholder="e.g., Read for 30 mins" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" placeholder="Details about the task..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reward">Reward (Minutes)</Label>
                                    <Input id="reward" type="number" placeholder="15" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    createTask.mutate({});
                                    setIsCreateOpen(false);
                                }}>Create Task</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="pending" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Approval
                    </TabsTrigger>
                    <TabsTrigger value="available" className="gap-2">
                        <Star className="h-4 w-4" />
                        Available Tasks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Waiting for Review</CardTitle>
                            <CardDescription>Tasks marked as complete by your child</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {completions?.filter((c: any) => c.status === 'pending').map((completion: any) => {
                                    const task = tasks?.find((t: any) => t.id === completion.task_id);
                                    return (
                                        <div key={completion.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{task?.title || "Unknown Task"}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Reward: {task?.reward_minutes} mins • {completion.notes || "No notes"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveCompletion.mutate(completion.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!completions || completions.filter((c: any) => c.status === 'pending').length === 0) && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No pending tasks to review.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="available">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tasks?.map((task: any) => (
                            <Card key={task.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{task.title}</CardTitle>
                                    <CardDescription>Reward: {task.reward_minutes} minutes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                                    <div className="flex justify-between items-center">
                                        <Badge variant={task.is_recurring ? "secondary" : "outline"}>
                                            {task.is_recurring ? "Recurring" : "One-time"}
                                        </Badge>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
