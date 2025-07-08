-- Create storage buckets for simple document management
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('original-documents', 'original-documents', true),
  ('document-summaries', 'document-summaries', true);

-- Create policies for original documents bucket
CREATE POLICY "Anyone can view original documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'original-documents');

CREATE POLICY "Anyone can upload original documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'original-documents');

CREATE POLICY "Anyone can update original documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'original-documents');

CREATE POLICY "Anyone can delete original documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'original-documents');

-- Create policies for document summaries bucket
CREATE POLICY "Anyone can view document summaries" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'document-summaries');

CREATE POLICY "Anyone can upload document summaries" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'document-summaries');

CREATE POLICY "Anyone can update document summaries" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'document-summaries');

CREATE POLICY "Anyone can delete document summaries" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'document-summaries');