import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Shield } from 'lucide-react';

interface SafeZone {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
}

interface SafeZonesMapProps {
    zones: SafeZone[];
    apiKey: string;
}

// Component to render circles on the map
function SafeZoneCircles({ zones }: { zones: SafeZone[] }) {
    const map = useMap();

    React.useEffect(() => {
        if (!map) return;

        const circles = zones.map((zone) => {
            return new google.maps.Circle({
                map: map,
                center: { lat: zone.latitude, lng: zone.longitude },
                radius: zone.radius_meters,
                fillColor: '#22c55e',
                fillOpacity: 0.2,
                strokeColor: '#22c55e',
                strokeOpacity: 0.6,
                strokeWeight: 2,
            });
        });

        return () => {
            circles.forEach((circle) => circle.setMap(null));
        };
    }, [map, zones]);

    return null;
}

export function SafeZonesMap({ zones, apiKey }: SafeZonesMapProps) {
    const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = React.useState<string | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = React.useState(true);

    // Get user's current location
    React.useEffect(() => {
        console.log('🗺️ Requesting user location...');

        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported by your browser');
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('✅ Got user location:', loc);
                setUserLocation(loc);
                setIsLoadingLocation(false);
            },
            (error) => {
                console.error('❌ Geolocation error:', error.message);
                setLocationError(error.message);
                setIsLoadingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-muted/50 rounded-lg">
                <div className="text-center p-6">
                    <Shield className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Google Maps API key not configured</p>
                    <p className="text-xs text-muted-foreground mt-2">Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
                </div>
            </div>
        );
    }

    // Show loading state while getting location
    if (isLoadingLocation) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-muted/50 rounded-lg">
                <div className="text-center p-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Getting your location...</p>
                    <p className="text-xs text-muted-foreground mt-2">Please allow location access</p>
                </div>
            </div>
        );
    }

    // Show error if location failed
    if (locationError || !userLocation) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-muted/50 rounded-lg">
                <div className="text-center p-6">
                    <Shield className="h-10 w-10 mx-auto mb-4 text-red-500" />
                    <p className="text-muted-foreground font-medium">Unable to get your location</p>
                    <p className="text-xs text-red-600 mt-2">{locationError || 'Location access denied'}</p>
                    <p className="text-xs text-muted-foreground mt-2">Please enable location access in your browser</p>
                </div>
            </div>
        );
    }

    console.log('📍 Rendering map at user location:', userLocation);

    return (
        <div className="h-full min-h-[400px] w-full rounded-lg overflow-hidden">
            <APIProvider apiKey={apiKey}>
                <Map
                    center={userLocation}
                    zoom={16}
                    mapId="safe-zones-map"
                    gestureHandling="greedy"
                    style={{ width: '100%', height: '100%', minHeight: '400px' }}
                >
                    {/* User's current location - blue marker */}
                    <AdvancedMarker position={userLocation} title="Your Current Location">
                        <Pin background={'#3b82f6'} borderColor={'#fff'} glyphColor={'#fff'} />
                    </AdvancedMarker>

                    {/* Safe zones - green markers */}
                    {zones.map((zone) => (
                        <AdvancedMarker
                            key={zone.id}
                            position={{ lat: zone.latitude, lng: zone.longitude }}
                            title={zone.name}
                        >
                            <Pin background={'#22c55e'} borderColor={'#fff'} glyphColor={'#fff'} />
                        </AdvancedMarker>
                    ))}

                    <SafeZoneCircles zones={zones} />
                </Map>
            </APIProvider>
        </div>
    );
}
