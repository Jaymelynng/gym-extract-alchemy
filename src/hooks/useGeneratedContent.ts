import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedFile {
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
}

interface GeneratedResult {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fileCount: number;
  totalSize: string;
  files: GeneratedFile[];
}

export const useGeneratedContent = (jobId: string | null) => {
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchGeneratedContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get the job details to check for original file
        const { data: jobData, error: jobError } = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (jobError) throw jobError;

        // Get generated content
        const { data, error } = await supabase
          .from('generated_content')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group files by category
        const categorizedResults: { [key: string]: any } = {};
        
        // Add original document category if it exists
        if (jobData.original_file_path) {
          const { data: { publicUrl } } = supabase.storage
            .from('document-processing')
            .getPublicUrl(jobData.original_file_path);

          categorizedResults['original'] = {
            id: 'original',
            title: 'Original Document',
            description: 'Your uploaded document, preserved exactly as uploaded',
            files: [{
              name: jobData.file_name,
              type: jobData.file_name.split('.').pop()?.toLowerCase() || 'file',
              size: `${Math.round((jobData.original_file_size || 0) / 1024)} KB`,
              downloadUrl: publicUrl
            }],
            totalSizeBytes: jobData.original_file_size || 0
          };
        }
        
        data?.forEach((file) => {
          if (!categorizedResults[file.category]) {
            categorizedResults[file.category] = {
              id: file.category,
              title: file.title,
              description: file.description,
              files: [],
              totalSizeBytes: 0
            };
          }

          // Get public URL for file
          const { data: { publicUrl } } = supabase.storage
            .from('document-processing')
            .getPublicUrl(file.file_path);

          categorizedResults[file.category].files.push({
            name: file.file_name,
            type: file.file_type,
            size: file.file_size,
            downloadUrl: publicUrl
          });

          // Calculate total size
          const sizeInBytes = parseInt(file.file_size.replace(' KB', '')) * 1024;
          categorizedResults[file.category].totalSizeBytes += sizeInBytes;
        });

        // Convert to array format, prioritizing original document first
        const formattedResults = Object.values(categorizedResults)
          .map((category: any) => ({
            ...category,
            fileCount: category.files.length,
            totalSize: `${Math.round(category.totalSizeBytes / 1024)} KB`,
            icon: getCategoryIcon(category.id)
          }))
          .sort((a, b) => {
            if (a.id === 'original') return -1;
            if (b.id === 'original') return 1;
            return 0;
          });

        setResults(formattedResults);
      } catch (err) {
        console.error('Failed to fetch generated content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedContent();
  }, [jobId]);

  return { results, loading, error };
};

const getCategoryIcon = (categoryId: string) => {
  // Return icon names as strings since we can't import React components in hooks
  switch (categoryId) {
    case 'original':
      return 'FileText';
    case 'social-media':
      return 'Smartphone';
    case 'ai-chunks':
      return 'Bot';
    case 'summaries':
      return 'FileText';
    default:
      return 'File';
  }
};