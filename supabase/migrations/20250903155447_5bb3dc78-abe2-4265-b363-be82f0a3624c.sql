-- STORAGE SECURITY FIXES

-- Secure the listing-photos bucket with proper RLS policies
-- Drop any existing permissive policies first
DROP POLICY IF EXISTS "Give users access to own folder 1rqpeul_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1rqpeul_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1rqpeul_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1rqpeul_3" ON storage.objects;

-- Create secure storage policies for listing-photos bucket
-- Allow public read access to listing photos (needed for viewing listings)
CREATE POLICY "Public read access for listing photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-photos');

-- Only authenticated users can upload photos
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos' 
  AND auth.uid() IS NOT NULL
);

-- Users can only update/delete their own uploaded photos
-- This requires the file path to contain their user ID as a folder
CREATE POLICY "Users can update their own listing photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own listing photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);