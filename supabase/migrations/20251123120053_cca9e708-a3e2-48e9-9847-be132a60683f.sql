-- Add session_type column to track manual vs automatic sessions
ALTER TABLE public.screen_sessions 
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'automatic' CHECK (session_type IN ('manual', 'automatic'));