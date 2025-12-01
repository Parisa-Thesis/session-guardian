import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentData } from "@/hooks/useParentData";
import { useLocationData } from "@/hooks/useLocationData";
import { MapPin, Shield, History, Plus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function LocationPage() {
    const { data: parentData, isLoading: isLoadingParent } = useParentData();
    const [selectedChildId, setSelectedChildId] = useState<string>("");

    // Auto-select first child
    if (parentData?.children?.length && !selectedChildId) {
        setSelectedChildId(parentData.children[0].id);
    }

    const { safeZones, locationHistory, isLoading: isLoadingLocation } = useLocationData(selectedChildId);

    if (isLoadingParent || (selectedChildId && isLoadingLocation)) {
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
                    <h1 className="text-3xl font-bold">Location & Safety</h1>
                    <p className="text-muted-foreground">Manage safe zones and view location history</p>
                </div>

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
            </div>

            {!selectedChildId ? (
                <Card className="p-12 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Children Selected</h3>
                    <p className="text-muted-foreground">
                        Please add a child profile or select one to view location data.
                    </p>
                </Card>
            ) : (
                <Tabs defaultValue="zones" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="zones" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Safe Zones
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            Location History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="zones">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Defined Zones</CardTitle>
                                        <CardDescription>Areas where your child is considered safe</CardDescription>
                                    </div>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Zone
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {safeZones?.map((zone) => (
                                            <div
                                                key={zone.id}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                                        <Shield className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{zone.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {zone.radius_meters}m radius
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        ))}
                                        {(!safeZones || safeZones.length === 0) && (
                                            <p className="text-center text-muted-foreground py-8">
                                                No safe zones defined yet.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-muted/50 flex items-center justify-center min-h-[300px]">
                                <div className="text-center p-6">
                                    <MapPin className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">Map View Placeholder</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        (Map integration would go here)
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Timeline</CardTitle>
                                <CardDescription>Recent location updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {locationHistory?.map((point, index) => (
                                        <div key={point.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                {point.is_safe_zone ? (
                                                    <Shield className="h-5 w-5" />
                                                ) : (
                                                    <Navigation className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900">
                                                        {point.is_safe_zone ? "In Safe Zone" : "On the Move"}
                                                    </div>
                                                    <time className="font-caveat font-medium text-indigo-500">
                                                        {format(new Date(point.timestamp), "HH:mm")}
                                                    </time>
                                                </div>
                                                <div className="text-slate-500 text-sm">
                                                    {point.is_safe_zone
                                                        ? `Arrived at ${safeZones?.find(z => z.id === point.safe_zone_id)?.name || "Safe Zone"}`
                                                        : `Lat: ${point.latitude.toFixed(4)}, Lng: ${point.longitude.toFixed(4)}`
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
