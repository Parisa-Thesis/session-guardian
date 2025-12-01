import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParentalControls } from "@/hooks/useParentalControls";
import { Trash2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SmartSchedule({ childId }: { childId: string }) {
    const { schedules, addScheduleBlock, deleteScheduleBlock } = useParentalControls(childId);
    const [newBlock, setNewBlock] = useState({
        day_of_week: "1", // Monday
        start_time: "08:00",
        end_time: "15:00",
        label: "School"
    });

    const handleAdd = () => {
        if (!childId) return;
        addScheduleBlock.mutate({
            child_id: childId,
            day_of_week: parseInt(newBlock.day_of_week),
            start_time: newBlock.start_time,
            end_time: newBlock.end_time,
            label: newBlock.label
        }, {
            onSuccess: () => toast.success("Schedule block added"),
            onError: (err) => toast.error(err.message)
        });
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Smart Blocking Schedule
                </CardTitle>
                <CardDescription>Define recurring blocked times (e.g., School, Sleep)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Add New Block Form */}
                    <div className="grid gap-4 md:grid-cols-5 items-end border p-4 rounded-lg bg-muted/20">
                        <div className="space-y-2">
                            <Label>Day</Label>
                            <Select
                                value={newBlock.day_of_week}
                                onValueChange={(v) => setNewBlock({ ...newBlock, day_of_week: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((day, i) => (
                                        <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={newBlock.start_time}
                                onChange={(e) => setNewBlock({ ...newBlock, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={newBlock.end_time}
                                onChange={(e) => setNewBlock({ ...newBlock, end_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                                placeholder="e.g. School"
                                value={newBlock.label}
                                onChange={(e) => setNewBlock({ ...newBlock, label: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={addScheduleBlock.isPending}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Block
                        </Button>
                    </div>

                    {/* Schedule List */}
                    <div className="space-y-4">
                        {DAYS.map((day, dayIndex) => {
                            const daySchedules = schedules?.filter((s: any) => s.day_of_week === dayIndex);
                            if (!daySchedules?.length) return null;

                            return (
                                <div key={day} className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">{day}</h4>
                                    <div className="space-y-2">
                                        {daySchedules.map((schedule: any) => (
                                            <div key={schedule.id} className="flex items-center justify-between bg-card p-3 rounded border">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium w-24">{schedule.label}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteScheduleBlock.mutate(schedule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {(!schedules || schedules.length === 0) && (
                            <p className="text-center text-muted-foreground py-4">No scheduled blocks yet.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
