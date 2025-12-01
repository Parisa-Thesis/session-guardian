import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Gamepad2, MessageSquare, GraduationCap, Tv, MoreHorizontal } from "lucide-react";

interface ActivityEntry {
    id: string;
    app_name: string;
    app_category: string;
    start_time: string;
    end_time: string | null;
    duration_minutes: number;
}

interface ActivityTimelineProps {
    activities: ActivityEntry[];
    selectedDate: Date;
}

const CATEGORY_ICONS: Record<string, any> = {
    games: Gamepad2,
    social: MessageSquare,
    educational: GraduationCap,
    entertainment: Tv,
    other: MoreHorizontal
};

const CATEGORY_COLORS: Record<string, string> = {
    games: 'bg-purple-500',
    social: 'bg-blue-500',
    educational: 'bg-green-500',
    entertainment: 'bg-orange-500',
    other: 'bg-gray-500'
};

export function ActivityTimeline({
    activities,
    selectedDate
}: ActivityTimelineProps) {
    // Group activities by hour
    const groupedByHour = activities.reduce((acc, activity) => {
        const hour = new Date(activity.start_time).getHours();
        if (!acc[hour]) {
            acc[hour] = [];
        }
        acc[hour].push(activity);
        return acc;
    }, {} as Record<number, ActivityEntry[]>);

    // Generate hours array (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <Card className="p-6">
            <div className="mb-4">
                <h3 className="font-semibold">Activity Timeline</h3>
                <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "MMMM d, yyyy")}
                </p>
            </div>

            <div className="space-y-1">
                {hours.map((hour) => {
                    const hourActivities = groupedByHour[hour] || [];
                    const hasActivity = hourActivities.length > 0;
                    const totalMinutes = hourActivities.reduce((sum, a) => sum + a.duration_minutes, 0);

                    return (
                        <div key={hour} className="flex gap-3">
                            {/* Time label */}
                            <div className="w-16 text-sm text-muted-foreground text-right pt-1">
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            {/* Timeline bar */}
                            <div className="flex-1 min-h-[40px] relative">
                                {hasActivity ? (
                                    <div className="space-y-1">
                                        {hourActivities.map((activity) => {
                                            const Icon = CATEGORY_ICONS[activity.app_category] || MoreHorizontal;
                                            const colorClass = CATEGORY_COLORS[activity.app_category] || 'bg-gray-500';
                                            const startTime = format(new Date(activity.start_time), 'HH:mm');
                                            const endTime = activity.end_time
                                                ? format(new Date(activity.end_time), 'HH:mm')
                                                : 'now';

                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                                                >
                                                    <div className={`p-1.5 rounded-full ${colorClass} text-white`}>
                                                        <Icon className="h-3 w-3" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {activity.app_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {startTime} - {endTime} ({activity.duration_minutes}m)
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-[40px] flex items-center">
                                        <div className="w-full h-px bg-border"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {activities.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    No activity recorded for this date
                </p>
            )}
        </Card>
    );
}
