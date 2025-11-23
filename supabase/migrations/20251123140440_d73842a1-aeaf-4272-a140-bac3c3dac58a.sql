-- Allow researchers to view parent profiles so they can send consent requests
CREATE POLICY "Researchers can view parent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'researcher' 
  AND role = 'parent'
);