import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Mock data
const MOCK_REPORTS = [
    {
        id: "1",
        report_date: "2024-05-20",
        status: "sent",
        summary_json: {
            total_screen_time: 1260, // minutes
            most_used_app: "Minecraft",
            flagged_incidents: 2,
            educational_percentage: 15,
        },
        created_at: "2024-05-20T10:00:00Z",
    },
    {
        id: "2",
        report_date: "2024-05-13",
        status: "sent",
        summary_json: {
            total_screen_time: 1400,
            most_used_app: "YouTube",
            flagged_incidents: 0,
            educational_percentage: 30,
        },
        created_at: "2024-05-13T10:00:00Z",
    },
];

export const useWeeklyReport = () => {
    const queryClient = useQueryClient();

    const { data: reports, isLoading } = useQuery({
        queryKey: ["weekly-reports"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return MOCK_REPORTS;
        },
    });

    const generateReport = useMutation({
        mutationFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success("Weekly report generated and sent to your email.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
        },
    });

    return {
        reports,
        isLoading,
        generateReport,
    };
};
