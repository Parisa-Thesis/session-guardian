-- Allow parents to update their own children's screen sessions (e.g., stopping sessions)
CREATE POLICY "Parents can update children's sessions"
ON public.screen_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = screen_sessions.child_id
      AND children.parent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = screen_sessions.child_id
      AND children.parent_id = auth.uid()
  )
);