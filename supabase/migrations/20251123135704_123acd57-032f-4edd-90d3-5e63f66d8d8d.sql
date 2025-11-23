-- Add foreign key for researcher_id if not exists
ALTER TABLE consents DROP CONSTRAINT IF EXISTS consents_researcher_id_fkey;
ALTER TABLE consents 
  ADD CONSTRAINT consents_researcher_id_fkey 
  FOREIGN KEY (researcher_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Allow researchers to create consent requests
CREATE POLICY "Researchers can create consent requests"
ON consents
FOR INSERT
TO authenticated
WITH CHECK (
  researcher_id = auth.uid() AND
  get_user_role(auth.uid()) = 'researcher'::user_role
);

-- Allow researchers to view their own consent requests
CREATE POLICY "Researchers can view their requests"
ON consents
FOR SELECT
TO authenticated
USING (
  researcher_id = auth.uid() AND
  get_user_role(auth.uid()) = 'researcher'::user_role
);

-- Allow admins to view all consents
CREATE POLICY "Admins can view all consents"
ON consents
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);