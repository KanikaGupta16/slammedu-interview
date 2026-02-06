-- Allow insert and select for uploads bucket (anon + authenticated for uploads from app)
CREATE POLICY "Allow insert on uploads bucket"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow select on uploads bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'uploads');
