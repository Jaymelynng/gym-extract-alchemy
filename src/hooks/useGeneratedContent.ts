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

        const { data, error } = await supabase
          .from('generated_content')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group files by category
        const categorizedResults: { [key: string]: any } = {};
        
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

        // Convert to array format
        const formattedResults = Object.values(categorizedResults).map((category: any) => ({
          ...category,
          fileCount: category.files.length,
          totalSize: `${Math.round(category.totalSizeBytes / 1024)} KB`,
          icon: getCategoryIcon(category.id)
        }));

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