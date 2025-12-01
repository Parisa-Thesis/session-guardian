import { Button } from "@/components/ui/button";
import { Pause, Unlock, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuickActionsProps {
    childId: string;
    childName: string;
    onPauseDevice: (childId: string, reason?: string) => Promise<void>;
    onUnlockDevice: (childId: string) => Promise<void>;
    onGrantTime: (childId: string, minutes: number, reason?: string) => Promise<void>;
    isPaused: boolean;
}

export function QuickActions({
    childId,
    childName,
    onPauseDevice,
    onUnlockDevice,
    onGrantTime,
    isPaused
}: QuickActionsProps) {
    const [showGrantTimeDialog, setShowGrantTimeDialog] = useState(false);
    const [showPauseDialog, setShowPauseDialog] = useState(false);
    const [grantMinutes, setGrantMinutes] = useState("30");
    const [reason, setReason] = useState("");

    const handlePause = async () => {
        await onPauseDevice(childId, reason);
        setShowPauseDialog(false);
        setReason("");
    };

    const handleGrantTime = async () => {
        const minutes = parseInt(grantMinutes);
        if (minutes > 0) {
            await onGrantTime(childId, minutes, reason);
            setShowGrantTimeDialog(false);
            setGrantMinutes("30");
            setReason("");
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-3">
                {isPaused ? (
                    <Button
                        size="lg"
                        variant="default"
                        className="gap-2 flex-1 min-w-[200px]"
                        onClick={() => onUnlockDevice(childId)}
                    >
                        <Unlock className="h-5 w-5" />
                        Unlock All Devices
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant="destructive"
                        className="gap-2 flex-1 min-w-[200px]"
                        onClick={() => setShowPauseDialog(true)}
                    >
                        <Pause className="h-5 w-5" />
                        Pause All Devices
                    </Button>
                )}

                <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 flex-1 min-w-[200px]"
                    onClick={() => setShowGrantTimeDialog(true)}
                >
                    <Clock className="h-5 w-5" />
                    Grant Extra Time
                </Button>
            </div>

            {/* Grant Time Dialog */}
            <Dialog open={showGrantTimeDialog} onOpenChange={setShowGrantTimeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grant Extra Time</DialogTitle>
                        <DialogDescription>
                            Give {childName} additional screen time
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="minutes">Extra Minutes</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGrantMinutes("15")}
                                >
                                    15 min
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGrantMinutes("30")}
                                >
                                    30 min
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGrantMinutes("60")}
                                >
                                    1 hour
                                </Button>
                            </div>
                            <Input
                                id="minutes"
                                type="number"
                                min="1"
                                value={grantMinutes}
                                onChange={(e) => setGrantMinutes(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Finished homework early"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGrantTimeDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGrantTime}>
                            Grant {grantMinutes} Minutes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pause Dialog */}
            <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pause All Devices</DialogTitle>
                        <DialogDescription>
                            This will immediately lock all of {childName}'s devices
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pause-reason">Reason (optional)</Label>
                            <Textarea
                                id="pause-reason"
                                placeholder="e.g., Dinner time, Bedtime"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handlePause}>
                            Pause Devices
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
