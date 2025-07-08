-- Create simplified documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  ai_category TEXT,
  ai_tags TEXT[],
  ai_summary TEXT,
  folder_path TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES public.documents(id)
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth yet)
CREATE POLICY "Anyone can view documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update documents" 
ON public.documents 
FOR UPDATE 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_documents_hash ON public.documents(file_hash);
CREATE INDEX idx_documents_category ON public.documents(ai_category);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(ai_tags);
CREATE INDEX idx_documents_folder ON public.documents(folder_path);

-- Create storage bucket for organized documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organized-documents', 'organized-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view organized documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'organized-documents');

CREATE POLICY "Anyone can upload organized documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'organized-documents');

-- Clean up old complex tables if they exist
DROP TABLE IF EXISTS public.generated_content CASCADE;
DROP TABLE IF EXISTS public.detected_topics CASCADE;
DROP TABLE IF EXISTS public.processing_jobs CASCADE;