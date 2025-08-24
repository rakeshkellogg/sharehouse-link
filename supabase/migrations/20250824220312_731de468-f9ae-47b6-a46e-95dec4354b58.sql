-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);

-- Create policies for listing photos
CREATE POLICY "Anyone can view listing photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);