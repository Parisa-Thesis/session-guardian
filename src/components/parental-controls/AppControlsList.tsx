import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Gamepad2, MessageSquare, GraduationCap, Tv, MoreHorizontal, Plus, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AppControl {
    id: string;
    app_name: string;
    app_category: string;
    is_blocked: boolean;
    daily_limit_minutes: number | null;
    is_unlimited: boolean;
}

interface AppControlsListProps {
    appControls: AppControl[];
    onUpdateApp: (id: string, updates: Partial<AppControl>) => Promise<void>;
    onAddApp: (app: Omit<AppControl, 'id'>) => Promise<void>;
}

const CATEGORY_ICONS: Record<string, any> = {
    games: Gamepad2,
    social: MessageSquare,
    educational: GraduationCap,
    entertainment: Tv,
    other: MoreHorizontal
};

const CATEGORY_COLORS: Record<string, string> = {
    games: 'text-purple-500',
    social: 'text-blue-500',
    educational: 'text-green-500',
    entertainment: 'text-orange-500',
    other: 'text-gray-500'
};

export function AppControlsList({
    appControls,
    onUpdateApp,
    onAddApp
}: AppControlsListProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingApp, setEditingApp] = useState<AppControl | null>(null);
    const [formData, setFormData] = useState({
        app_name: "",
        app_category: "other",
        is_blocked: false,
        daily_limit_minutes: null as number | null,
        is_unlimited: false
    });

    const groupedApps = appControls.reduce((acc, app) => {
        if (!acc[app.app_category]) {
            acc[app.app_category] = [];
        }
        acc[app.app_category].push(app);
        return acc;
    }, {} as Record<string, AppControl[]>);

    const handleSave = async () => {
        if (editingApp) {
            await onUpdateApp(editingApp.id, formData);
            setEditingApp(null);
        } else {
            await onAddApp(formData as Omit<AppControl, 'id'>);
        }
        setShowAddDialog(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            app_name: "",
            app_category: "other",
            is_blocked: false,
            daily_limit_minutes: null,
            is_unlimited: false
        });
    };

    const openEditDialog = (app: AppControl) => {
        setEditingApp(app);
        setFormData({
            app_name: app.app_name,
            app_category: app.app_category,
            is_blocked: app.is_blocked,
            daily_limit_minutes: app.daily_limit_minutes,
            is_unlimited: app.is_unlimited
        });
        setShowAddDialog(true);
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">App Controls</h3>
                    <Button
                        size="sm"
                        onClick={() => {
                            resetForm();
                            setEditingApp(null);
                            setShowAddDialog(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add App
                    </Button>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedApps).map(([category, apps]) => {
                        const Icon = CATEGORY_ICONS[category] || MoreHorizontal;
                        const colorClass = CATEGORY_COLORS[category] || 'text-gray-500';

                        return (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`h-5 w-5 ${colorClass}`} />
                                    <h4 className="font-semibold capitalize">{category}</h4>
                                </div>
                                <div className="space-y-2">
                                    {apps.map((app) => (
                                        <div
                                            key={app.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <Switch
                                                    checked={!app.is_blocked}
                                                    onCheckedChange={(checked) =>
                                                        onUpdateApp(app.id, { is_blocked: !checked })
                                                    }
                                                />
                                                <div className="flex-1">
                                                    <h5 className="font-medium">{app.app_name}</h5>
                                                    <p className="text-sm text-muted-foreground">
                                                        {app.is_unlimited
                                                            ? '⏱️ Unlimited'
                                                            : app.daily_limit_minutes
                                                                ? `⏱️ ${Math.floor(app.daily_limit_minutes / 60)}h ${app.daily_limit_minutes % 60}m/day`
                                                                : 'No limit set'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {app.is_blocked && (
                                                    <Badge variant="destructive">Blocked</Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(app)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {appControls.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No apps configured. Add apps to control their usage.
                        </p>
                    )}
                </div>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingApp ? 'Edit App Control' : 'Add App Control'}</DialogTitle>
                        <DialogDescription>
                            Configure time limits and restrictions for this app
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="app-name">App Name</Label>
                            <Input
                                id="app-name"
                                placeholder="e.g., YouTube, Minecraft"
                                value={formData.app_name}
                                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.app_category}
                                onValueChange={(value) => setFormData({ ...formData, app_category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="games">🎮 Games</SelectItem>
                                    <SelectItem value="social">💬 Social Media</SelectItem>
                                    <SelectItem value="educational">📚 Educational</SelectItem>
                                    <SelectItem value="entertainment">📺 Entertainment</SelectItem>
                                    <SelectItem value="other">⚙️ Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="limit">Daily Limit (minutes)</Label>
                            <Input
                                id="limit"
                                type="number"
                                min="0"
                                placeholder="60"
                                value={formData.daily_limit_minutes || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    daily_limit_minutes: e.target.value ? parseInt(e.target.value) : null
                                })}
                                disabled={formData.is_unlimited}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="unlimited"
                                checked={formData.is_unlimited}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_unlimited: checked, daily_limit_minutes: null })
                                }
                            />
                            <Label htmlFor="unlimited">Unlimited access</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="blocked"
                                checked={formData.is_blocked}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_blocked: checked })
                                }
                            />
                            <Label htmlFor="blocked">Block this app</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!formData.app_name}>
                            {editingApp ? 'Save Changes' : 'Add App'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
