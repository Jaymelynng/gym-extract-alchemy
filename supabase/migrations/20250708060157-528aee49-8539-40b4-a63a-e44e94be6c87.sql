-- Create storage bucket for generated files
INSERT INTO storage.buckets (id, name, public) VALUES ('document-processing', 'document-processing', true);

-- Create storage policies for document processing files
CREATE POLICY "Anyone can view processed files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'document-processing');

CREATE POLICY "Service can insert processed files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'document-processing');

-- Create processing jobs table
CREATE TABLE public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_content INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  autonomous_mode BOOLEAN DEFAULT false
);

-- Create detected topics table
CREATE TABLE public.detected_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  pages INTEGER[] NOT NULL DEFAULT '{}',
  content_type TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated content table
CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.detected_topics(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies (public for now, can be restricted later)
CREATE POLICY "Anyone can view processing jobs" 
ON public.processing_jobs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert processing jobs" 
ON public.processing_jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update processing jobs" 
ON public.processing_jobs 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view detected topics" 
ON public.detected_topics 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert detected topics" 
ON public.detected_topics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view generated content" 
ON public.generated_content 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert generated content" 
ON public.generated_content 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_processing_jobs_updated_at
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at);
CREATE INDEX idx_detected_topics_job_id ON public.detected_topics(job_id);
CREATE INDEX idx_generated_content_job_id ON public.generated_content(job_id);