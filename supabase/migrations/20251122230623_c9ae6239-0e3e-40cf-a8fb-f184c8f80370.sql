-- Create parental_controls table
CREATE TABLE public.parental_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  daily_time_limit_minutes INTEGER,
  bedtime_start TIME,
  bedtime_end TIME,
  warning_threshold_minutes INTEGER DEFAULT 15,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;

-- Parents can manage their children's controls
CREATE POLICY "Parents can manage children's parental controls"
ON public.parental_controls
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = parental_controls.child_id
    AND children.parent_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_parental_controls_updated_at
BEFORE UPDATE ON public.parental_controls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();