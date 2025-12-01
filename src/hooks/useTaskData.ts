import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Mock data
const MOCK_TASKS = [
    {
        id: "1",
        title: "Complete Math Homework",
        description: "Chapter 5 exercises 1-10",
        reward_minutes: 30,
        is_recurring: false,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Clean Room",
        description: "Make bed and put away toys",
        reward_minutes: 15,
        is_recurring: true,
        created_at: new Date().toISOString(),
    },
];

const MOCK_COMPLETIONS = [
    {
        id: "1",
        task_id: "1",
        child_id: "child-1",
        status: "pending",
        completed_at: new Date().toISOString(),
        notes: "Done!",
    },
];

export const useTaskData = (childId?: string) => {
    const queryClient = useQueryClient();

    const { data: tasks, isLoading: isLoadingTasks } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return MOCK_TASKS;
        },
    });

    const { data: completions, isLoading: isLoadingCompletions } = useQuery({
        queryKey: ["task-completions", childId],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return MOCK_COMPLETIONS;
        },
        enabled: !!childId,
    });

    const createTask = useMutation({
        mutationFn: async (newTask: any) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("Task created successfully");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const approveCompletion = useMutation({
        mutationFn: async (completionId: string) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("Task approved! Bonus time added.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-completions"] });
        },
    });

    return {
        tasks,
        completions,
        isLoading: isLoadingTasks || isLoadingCompletions,
        createTask,
        approveCompletion,
    };
};
