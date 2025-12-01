import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, GraduationCap, BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Schedule {
    id: string;
    name: string;
    schedule_type: 'bedtime' | 'school' | 'homework' | 'custom';
    start_time: string;
    end_time: string;
    days_of_week: number[];
    allowed_apps: string[];
    is_active: boolean;
}

interface ScheduleManagerProps {
    schedules: Schedule[];
    availableApps: { app_name: string; app_category: string }[];
    onAddSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
    onUpdateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
    onDeleteSchedule: (id: string) => Promise<void>;
}

const SCHEDULE_ICONS = {
    bedtime: Moon,
    school: GraduationCap,
    homework: BookOpen,
    custom: Plus
};

const DAYS_OF_WEEK = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' }
];

export function ScheduleManager({
    schedules,
    availableApps,
    onAddSchedule,
    onUpdateSchedule,
    onDeleteSchedule
}: ScheduleManagerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        schedule_type: "custom" as Schedule['schedule_type'],
        start_time: "20:00",
        end_time: "07:00",
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        allowed_apps: [] as string[],
        is_active: true
    });

    const resetForm = () => {
        setFormData({
            name: "",
            schedule_type: "custom",
            start_time: "20:00",
            end_time: "07:00",
            days_of_week: [1, 2, 3, 4, 5, 6, 7],
            allowed_apps: [],
            is_active: true
        });
    };

    const handleSave = async () => {
        if (editingSchedule) {
            await onUpdateSchedule(editingSchedule.id, formData);
            setEditingSchedule(null);
        } else {
            await onAddSchedule(formData);
        }
        setShowAddDialog(false);
        resetForm();
    };

    const openEditDialog = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            name: schedule.name,
            schedule_type: schedule.schedule_type,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            days_of_week: schedule.days_of_week,
            allowed_apps: schedule.allowed_apps || [],
            is_active: schedule.is_active
        });
        setShowAddDialog(true);
    };

    const handleTypeChange = (value: Schedule['schedule_type']) => {
        let defaultName = "";
        let defaultStart = "20:00";
        let defaultEnd = "07:00";
        let defaultDays = [1, 2, 3, 4, 5, 6, 7];
        let newAllowedApps: string[] = [];

        switch (value) {
            case 'bedtime':
                defaultName = "Bedtime";
                defaultStart = "21:00";
                defaultEnd = "07:00";
                break;
            case 'school':
                defaultName = "School Time";
                defaultStart = "08:00";
                defaultEnd = "15:00";
                defaultDays = [1, 2, 3, 4, 5];
                // Auto-select educational apps
                newAllowedApps = availableApps
                    .filter(app =>
                        (app.app_category?.toLowerCase() || '').includes('education') ||
                        (app.app_category?.toLowerCase() || '').includes('school') ||
                        (app.app_category?.toLowerCase() || '').includes('reference')
                    )
                    .map(app => app.app_name);
                break;
            case 'homework':
                defaultName = "Homework";
                defaultStart = "16:00";
                defaultEnd = "18:00";
                defaultDays = [1, 2, 3, 4, 5];
                // Auto-select educational apps
                newAllowedApps = availableApps
                    .filter(app =>
                        (app.app_category?.toLowerCase() || '').includes('education') ||
                        (app.app_category?.toLowerCase() || '').includes('reference')
                    )
                    .map(app => app.app_name);
                break;
            case 'custom':
                defaultName = "Custom Schedule";
                break;
        }

        setFormData({
            ...formData,
            schedule_type: value,
            name: defaultName,
            start_time: defaultStart,
            end_time: defaultEnd,
            days_of_week: defaultDays,
            allowed_apps: newAllowedApps
        });
    };

    const toggleDay = (day: number) => {
        setFormData(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day].sort()
        }));
    };

    const toggleApp = (appName: string) => {
        setFormData(prev => ({
            ...prev,
            allowed_apps: prev.allowed_apps.includes(appName)
                ? prev.allowed_apps.filter(a => a !== appName)
                : [...prev.allowed_apps, appName]
        }));
    };

    const selectAllApps = () => {
        setFormData(prev => ({
            ...prev,
            allowed_apps: availableApps.map(a => a.app_name)
        }));
    };

    const clearAllApps = () => {
        setFormData(prev => ({
            ...prev,
            allowed_apps: []
        }));
    };

    const getTypeDescription = (type: Schedule['schedule_type']) => {
        switch (type) {
            case 'bedtime': return "Blocks all apps during sleep hours. You can't whitelist apps here.";
            case 'school': return "Limits access during school hours. Only educational apps are allowed by default.";
            case 'homework': return "Focus time for homework. Select specific apps needed for study.";
            case 'custom': return "Create a custom schedule with your own rules and allowed apps.";
        }
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Schedules</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            resetForm();
                            setEditingSchedule(null);
                            setShowAddDialog(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Schedule
                    </Button>
                </div>

                <div className="space-y-3">
                    {schedules.map((schedule) => {
                        const Icon = SCHEDULE_ICONS[schedule.schedule_type];
                        const daysText = schedule.days_of_week.length === 7
                            ? 'Every day'
                            : schedule.days_of_week.length === 5 && !schedule.days_of_week.includes(6) && !schedule.days_of_week.includes(7)
                                ? 'Weekdays'
                                : schedule.days_of_week.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ');

                        const allowedAppsCount = schedule.allowed_apps?.length || 0;

                        return (
                            <div
                                key={schedule.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${schedule.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{schedule.name}</h4>
                                            {!schedule.is_active && (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {schedule.start_time} - {schedule.end_time} • {daysText}
                                        </p>
                                        {schedule.schedule_type !== 'bedtime' && allowedAppsCount > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {allowedAppsCount} allowed apps
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditDialog(schedule)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteSchedule(schedule.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {schedules.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No schedules set. Add one to get started.
                        </p>
                    )}
                </div>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
                        <DialogDescription>
                            Set up a schedule to control device access
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.schedule_type}
                                onValueChange={handleTypeChange}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bedtime">🌙 Bedtime</SelectItem>
                                    <SelectItem value="school">🎓 School Time</SelectItem>
                                    <SelectItem value="homework">📚 Homework</SelectItem>
                                    <SelectItem value="custom">⚙️ Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {getTypeDescription(formData.schedule_type)}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Schedule Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Bedtime"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Input
                                    id="start-time"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-time">End Time</Label>
                                <Input
                                    id="end-time"
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Days of Week</Label>
                            <div className="flex gap-2 flex-wrap">
                                {DAYS_OF_WEEK.map((day) => (
                                    <Button
                                        key={day.value}
                                        variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleDay(day.value)}
                                    >
                                        {day.label.charAt(0)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {formData.schedule_type !== 'bedtime' && (
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>Allowed Apps</Label>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={selectAllApps} className="text-xs h-6 px-2">All</Button>
                                        <Button variant="ghost" size="sm" onClick={clearAllApps} className="text-xs h-6 px-2">None</Button>
                                    </div>
                                </div>
                                <ScrollArea className="h-[150px] w-full rounded-md border p-2">
                                    <div className="space-y-2">
                                        {availableApps.map((app) => (
                                            <div key={app.app_name} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`app-${app.app_name}`}
                                                    checked={formData.allowed_apps.includes(app.app_name)}
                                                    onCheckedChange={() => toggleApp(app.app_name)}
                                                />
                                                <label
                                                    htmlFor={`app-${app.app_name}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {app.app_name} <span className="text-xs text-muted-foreground">({app.app_category})</span>
                                                </label>
                                            </div>
                                        ))}
                                        {availableApps.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No apps found. Add apps in the "Apps" tab first.
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>
                                <p className="text-xs text-muted-foreground">
                                    Selected apps will be accessible during this schedule. All other apps will be blocked.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_active: checked as boolean })
                                }
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!formData.name}>
                            {editingSchedule ? 'Save Changes' : 'Add Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
