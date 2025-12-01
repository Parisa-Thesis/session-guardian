-- Create task_templates table
create table if not exists public.task_templates (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    default_reward_minutes integer default 15,
    category text default 'other',
    is_system boolean default false,
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.task_templates enable row level security;

-- Policies
create policy "Everyone can view system templates"
    on public.task_templates for select
    using (is_system = true);

create policy "Users can view their own templates"
    on public.task_templates for select
    using (created_by = auth.uid());

create policy "Users can insert their own templates"
    on public.task_templates for insert
    with check (created_by = auth.uid());

-- Seed data
insert into public.task_templates (title, description, default_reward_minutes, category, is_system)
values
    ('Read a book', 'Read for 30 minutes', 30, 'education', true),
    ('Clean bedroom', 'Tidy up room and make bed', 15, 'chore', true),
    ('Do homework', 'Complete daily homework assignments', 45, 'education', true),
    ('Walk the dog', 'Take the dog for a 20-minute walk', 20, 'chore', true),
    ('Practice instrument', 'Practice music for 30 minutes', 30, 'education', true),
    ('Brush teeth', 'Brush teeth for 2 minutes', 5, 'health', true),
    ('Empty dishwasher', 'Put away clean dishes', 10, 'chore', true),
    ('Take out trash', 'Take garbage bags to the curb', 10, 'chore', true),
    ('Exercise', '30 minutes of physical activity', 30, 'health', true),
    ('Help with dinner', 'Assist with meal preparation', 20, 'chore', true);
