import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useTaskData = (childId?: string) => {
    const queryClient = useQueryClient();

    const { data: tasks, isLoading: isLoadingTasks } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("parent_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const { data: completions, isLoading: isLoadingCompletions } = useQuery({
        queryKey: ["task-completions", childId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("task_completions")
                .select("*, tasks(title, reward_minutes)")
                .eq("child_id", childId)
                .order("completed_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!childId,
    });

    const createTask = useMutation({
        mutationFn: async (newTask: { title: string; description: string; reward_minutes: number; is_recurring: boolean }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("tasks")
                .insert({
                    parent_id: user.id,
                    ...newTask
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create task: ${error.message}`);
        }
    });

    const approveCompletion = useMutation({
        mutationFn: async (completionId: string) => {
            // 1. Get the completion details to find the task reward
            const { data: completion, error: fetchError } = await supabase
                .from("task_completions")
                .select("*, tasks(reward_minutes)")
                .eq("id", completionId)
                .single();

            if (fetchError || !completion) throw fetchError || new Error("Completion not found");

            // 2. Update completion status
            const { error: updateError } = await supabase
                .from("task_completions")
                .update({ status: "approved", reviewed_at: new Date().toISOString() })
                .eq("id", completionId);

            if (updateError) throw updateError;

            // 3. Add bonus minutes to child's daily aggregate
            // We need to find or create the aggregate for today
            const today = new Date().toISOString().split('T')[0];
            const rewardMinutes = completion.tasks?.reward_minutes || 0;

            // First try to update existing record
            const { data: existingAgg, error: aggError } = await supabase
                .from("child_daily_aggregate")
                .select("bonus_minutes")
                .eq("child_id", completion.child_id)
                .eq("date", today)
                .single();

            if (existingAgg) {
                await supabase
                    .from("child_daily_aggregate")
                    .update({ bonus_minutes: (existingAgg.bonus_minutes || 0) + rewardMinutes })
                    .eq("child_id", completion.child_id)
                    .eq("date", today);
            } else {
                // Create new record if it doesn't exist (though it usually should if they are active)
                await supabase
                    .from("child_daily_aggregate")
                    .insert({
                        child_id: completion.child_id,
                        date: today,
                        bonus_minutes: rewardMinutes,
                        total_screen_time_seconds: 0,
                        educational_screen_time_seconds: 0,
                        entertainment_screen_time_seconds: 0
                    });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-completions"] });
            toast.success("Task approved! Bonus time added.");
        },
        onError: (error) => {
            toast.error(`Failed to approve task: ${error.message}`);
        }
    });

    return {
        tasks,
        completions,
        isLoading: isLoadingTasks || isLoadingCompletions,
        createTask,
        approveCompletion,
    };
};
