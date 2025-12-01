import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaskTemplate {
    id: string;
    title: string;
    description: string;
    default_reward_minutes: number;
    category: string;
}

interface TaskSelectorProps {
    onSelect: (task: { title: string; description: string; reward: number }) => void;
    className?: string;
}

export function TaskSelector({ onSelect, className }: TaskSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [search, setSearch] = React.useState("");

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["task-templates"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("task_templates")
                .select("*")
                .order("title");

            if (error) {
                console.error("Error fetching templates:", error);
                return [];
            }
            return data as TaskTemplate[];
        },
    });

    const handleSelect = (template: TaskTemplate) => {
        onSelect({
            title: template.title,
            description: template.description || "",
            reward: template.default_reward_minutes || 15,
        });
        setValue(template.title);
        setOpen(false);
    };

    const handleCreateCustom = () => {
        if (!search) return;
        onSelect({
            title: search,
            description: "",
            reward: 15,
        });
        setValue(search);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {value ? value : "Select or type a task..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search tasks..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <div className="p-2">
                                <p className="text-sm text-muted-foreground mb-2">No task found.</p>
                                <Button
                                    size="sm"
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={handleCreateCustom}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create "{search}"
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {templates
                                .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
                                .map((template) => (
                                    <CommandItem
                                        key={template.id}
                                        value={template.title}
                                        onSelect={() => handleSelect(template)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === template.title ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{template.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {template.default_reward_minutes} mins • {template.category}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
