import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ScreenTimeLimitCardProps {
    dailyLimitMinutes: number;
    todayMinutes: number;
    onUpdateLimit: (minutes: number) => Promise<void>;
}

export function ScreenTimeLimitCard({
    dailyLimitMinutes,
    todayMinutes,
    onUpdateLimit
}: ScreenTimeLimitCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [limitHours, setLimitHours] = useState(Math.floor(dailyLimitMinutes / 60).toString());
    const [limitMinutes, setLimitMinutes] = useState((dailyLimitMinutes % 60).toString());

    const progressPercentage = dailyLimitMinutes > 0
        ? Math.min((todayMinutes / dailyLimitMinutes) * 100, 100)
        : 0;

    const remainingMinutes = Math.max(0, dailyLimitMinutes - todayMinutes);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;

    const isNearLimit = progressPercentage >= 80;
    const isOverLimit = progressPercentage >= 100;

    const handleSave = async () => {
        const hours = parseInt(limitHours) || 0;
        const mins = parseInt(limitMinutes) || 0;
        const totalMinutes = hours * 60 + mins;

        if (totalMinutes > 0) {
            await onUpdateLimit(totalMinutes);
            setShowEditDialog(false);
        }
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Daily Screen Time</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditDialog(true)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-foreground">
                                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
                            </span>
                            <span className="text-muted-foreground">
                                / {Math.floor(dailyLimitMinutes / 60)}h {dailyLimitMinutes % 60}m
                            </span>
                        </div>
                        <Progress
                            value={progressPercentage}
                            className={`h-3 ${isOverLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : ''}`}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className={isOverLimit ? 'text-red-600 font-semibold' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}>
                            {isOverLimit
                                ? '⚠️ Limit exceeded'
                                : isNearLimit
                                    ? '⚠️ Approaching limit'
                                    : `${remainingHours}h ${remainingMins}m remaining`
                            }
                        </span>
                        <span className="text-muted-foreground">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                </div>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Daily Screen Time Limit</DialogTitle>
                        <DialogDescription>
                            Set the maximum screen time allowed per day
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="hours">Hours</Label>
                                <Input
                                    id="hours"
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={limitHours}
                                    onChange={(e) => setLimitHours(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minutes">Minutes</Label>
                                <Input
                                    id="minutes"
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={limitMinutes}
                                    onChange={(e) => setLimitMinutes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLimitHours("1");
                                    setLimitMinutes("0");
                                }}
                            >
                                1 hour
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLimitHours("2");
                                    setLimitMinutes("0");
                                }}
                            >
                                2 hours
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLimitHours("3");
                                    setLimitMinutes("0");
                                }}
                            >
                                3 hours
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Limit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
