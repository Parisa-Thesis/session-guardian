import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentData } from "@/hooks/useParentData";
import { useLocationData } from "@/hooks/useLocationData";
import { MapPin, Shield, History, Plus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SafeZonesMap } from "@/components/maps/SafeZonesMap";

export default function LocationPage() {
    const { data: parentData, isLoading: isLoadingParent } = useParentData();
    const [selectedChildId, setSelectedChildId] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);
    const [newZone, setNewZone] = useState({
        name: "",
        latitude: 0,
        longitude: 0,
        radius_meters: 100
    });

    // Get Google Maps API key from environment variable
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

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
                                    <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsAddOpen(true)}
                                    >
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingZone(zone);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
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

                            <Card className="overflow-hidden">
                                <SafeZonesMap zones={safeZones || []} apiKey={mapsApiKey} />
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
                                    {locationHistory?.map((point) => (
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

            {/* Add Safe Zone Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Safe Zone</DialogTitle>
                        <DialogDescription>Create a new safe zone for your child.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-name">Zone Name</Label>
                            <Input
                                id="add-name"
                                placeholder="e.g., Home, School"
                                value={newZone.name}
                                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-lat">Latitude</Label>
                                <Input
                                    id="add-lat"
                                    type="number"
                                    step="0.000001"
                                    placeholder="51.5074"
                                    value={newZone.latitude || ""}
                                    onChange={(e) => setNewZone({ ...newZone, latitude: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-lng">Longitude</Label>
                                <Input
                                    id="add-lng"
                                    type="number"
                                    step="0.000001"
                                    placeholder="-0.1278"
                                    value={newZone.longitude || ""}
                                    onChange={(e) => setNewZone({ ...newZone, longitude: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-radius">Radius (meters)</Label>
                            <Input
                                id="add-radius"
                                type="number"
                                min="10"
                                placeholder="100"
                                value={newZone.radius_meters}
                                onChange={(e) => setNewZone({ ...newZone, radius_meters: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            💡 Tip: Right-click on Google Maps and select "What's here?" to get coordinates
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!newZone.name || !selectedChildId) return;

                                try {
                                    const { error } = await supabase
                                        .from("safe_zones")
                                        .insert({
                                            child_id: selectedChildId,
                                            name: newZone.name,
                                            latitude: newZone.latitude,
                                            longitude: newZone.longitude,
                                            radius_meters: newZone.radius_meters,
                                        });

                                    if (error) throw error;

                                    toast.success("Safe zone added successfully!");
                                    setIsAddOpen(false);
                                    setNewZone({ name: "", latitude: 0, longitude: 0, radius_meters: 100 });
                                    window.location.reload();
                                } catch (error: any) {
                                    console.error("Failed to add safe zone:", error);
                                    toast.error("Failed to add safe zone: " + error.message);
                                }
                            }}
                            disabled={!newZone.name}
                        >
                            Add Zone
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Safe Zone Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Safe Zone</DialogTitle>
                        <DialogDescription>Update the safe zone details.</DialogDescription>
                    </DialogHeader>
                    {editingZone && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Zone Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingZone.name}
                                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-radius">Radius (meters)</Label>
                                <Input
                                    id="edit-radius"
                                    type="number"
                                    min="10"
                                    value={editingZone.radius_meters}
                                    onChange={(e) => setEditingZone({ ...editingZone, radius_meters: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!editingZone?.id) return;

                                try {
                                    const { error } = await supabase
                                        .from("safe_zones")
                                        .update({
                                            name: editingZone.name,
                                            radius_meters: editingZone.radius_meters,
                                        })
                                        .eq("id", editingZone.id);

                                    if (error) throw error;

                                    toast.success("Safe zone updated successfully!");
                                    setIsEditOpen(false);
                                    setEditingZone(null);
                                    window.location.reload();
                                } catch (error: any) {
                                    console.error("Failed to update safe zone:", error);
                                    toast.error("Failed to update safe zone: " + error.message);
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
