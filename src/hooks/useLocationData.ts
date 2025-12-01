import { useQuery } from "@tanstack/react-query";

// Mock data for demonstration since backend tables might not exist yet
const MOCK_SAFE_ZONES = [
    {
        id: "1",
        name: "Home",
        latitude: 40.7128,
        longitude: -74.0060,
        radius_meters: 100,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "School",
        latitude: 40.7589,
        longitude: -73.9851,
        radius_meters: 200,
        created_at: new Date().toISOString(),
    },
];

const MOCK_HISTORY = [
    {
        id: "1",
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        is_safe_zone: true,
        safe_zone_id: "1",
    },
    {
        id: "2",
        latitude: 40.7200,
        longitude: -74.0100,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        is_safe_zone: false,
        safe_zone_id: null,
    },
    {
        id: "3",
        latitude: 40.7589,
        longitude: -73.9851,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        is_safe_zone: true,
        safe_zone_id: "2",
    },
];

export const useLocationData = (childId?: string) => {
    const { data: safeZones, isLoading: isLoadingZones } = useQuery({
        queryKey: ["safe-zones", childId],
        queryFn: async () => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return MOCK_SAFE_ZONES;
        },
        enabled: !!childId,
    });

    const { data: locationHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["location-history", childId],
        queryFn: async () => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return MOCK_HISTORY;
        },
        enabled: !!childId,
    });

    return {
        safeZones,
        locationHistory,
        isLoading: isLoadingZones || isLoadingHistory,
    };
};
