import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocationData } from "@/hooks/useLocationData";
import { ArrowLeft, MapPin, Shield, Navigation } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectLocation() {
    const { childId } = useParams();
    const navigate = useNavigate();
    const { locationHistory, isLoading } = useLocationData(childId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Subject Location Data</h1>
                    <p className="text-muted-foreground">View location history for participant</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Location Timeline</CardTitle>
                        <CardDescription>Recorded location points (consented data only)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(!locationHistory || locationHistory.length === 0) ? (
                            <div className="text-center py-12">
                                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">No location data available for this participant.</p>
                            </div>
                        ) : (
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {locationHistory.map((point) => (
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
                                                    {format(new Date(point.timestamp), "MMM d, HH:mm")}
                                                </time>
                                            </div>
                                            <div className="text-slate-500 text-sm">
                                                {point.is_safe_zone
                                                    ? "Safe Zone Entry"
                                                    : `Lat: ${point.latitude.toFixed(4)}, Lng: ${point.longitude.toFixed(4)}`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
