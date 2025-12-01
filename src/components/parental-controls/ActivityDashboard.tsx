import { Card } from "@/components/ui/card";
import { Clock, Smartphone, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ActivityDashboardProps {
    childName: string;
    currentApp: string | null;
    isActive: boolean;
    todayMinutes: number;
    dailyLimitMinutes: number;
    weeklyMinutes: number;
    weeklyChange: number;
}

export function ActivityDashboard({
    childName,
    currentApp,
    isActive,
    todayMinutes,
    dailyLimitMinutes,
    weeklyMinutes,
    weeklyChange
}: ActivityDashboardProps) {
    const todayHours = Math.floor(todayMinutes / 60);
    const todayMins = todayMinutes % 60;
    const limitHours = Math.floor(dailyLimitMinutes / 60);
    const limitMins = dailyLimitMinutes % 60;
    const weeklyHours = Math.floor(weeklyMinutes / 60);
    const weeklyMins = weeklyMinutes % 60;

    const progressPercentage = dailyLimitMinutes > 0
        ? Math.min((todayMinutes / dailyLimitMinutes) * 100, 100)
        : 0;

    const isNearLimit = progressPercentage >= 80;
    const isOverLimit = progressPercentage >= 100;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Active Now */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Active Now</h3>
                    </div>
                    {isActive && (
                        <Badge variant="destructive" className="animate-pulse">
                            <span className="relative flex h-2 w-2 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Live
                        </Badge>
                    )}
                </div>
                <div className="text-2xl font-bold text-foreground">
                    {currentApp || "No activity"}
                </div>
                {currentApp && (
                    <p className="text-sm text-muted-foreground mt-1">
                        Currently using
                    </p>
                )}
            </Card>

            {/* Today's Usage */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Today</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                            {todayHours}h {todayMins}m
                        </span>
                        {dailyLimitMinutes > 0 && (
                            <span className="text-sm text-muted-foreground">
                                of {limitHours}h {limitMins}m
                            </span>
                        )}
                    </div>
                    {dailyLimitMinutes > 0 && (
                        <>
                            <Progress
                                value={progressPercentage}
                                className={`h-2 ${isOverLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
                            />
                            <p className={`text-xs ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                                {isOverLimit
                                    ? '⚠️ Limit exceeded'
                                    : isNearLimit
                                        ? '⚠️ Approaching limit'
                                        : `${Math.round(progressPercentage)}% used`
                                }
                            </p>
                        </>
                    )}
                </div>
            </Card>

            {/* This Week */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">This Week</h3>
                </div>
                <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                        {weeklyHours}h {weeklyMins}m
                    </div>
                    <div className="flex items-center gap-2">
                        {weeklyChange > 0 ? (
                            <>
                                <TrendingUp className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600">
                                    ↑ {Math.abs(weeklyChange)}% more
                                </span>
                            </>
                        ) : weeklyChange < 0 ? (
                            <>
                                <TrendingDown className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600">
                                    ↓ {Math.abs(weeklyChange)}% less
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                No change
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
