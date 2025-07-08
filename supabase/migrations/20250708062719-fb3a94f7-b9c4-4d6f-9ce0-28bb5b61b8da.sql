-- Add original_file_path column to processing_jobs table to track the original document
ALTER TABLE public.processing_jobs 
ADD COLUMN original_file_path TEXT,
ADD COLUMN original_file_size BIGINT;