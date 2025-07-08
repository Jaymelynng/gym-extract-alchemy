import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingJob {
  id: string;
  file_name: string;
  file_size: number;
  status: string;
  total_content: number;
  created_at: string;
  updated_at: string;
  autonomous_mode: boolean;
}

interface GeneratedContent {
  id: string;
  job_id: string;
  category: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: string;
  created_at: string;
}

export const useJobHistory = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const getJobFiles = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch job files:', err);
      return [];
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      // Delete files from storage first
      const files = await getJobFiles(jobId);
      for (const file of files) {
        await supabase.storage
          .from('document-processing')
          .remove([file.file_path]);
      }

      // Delete job (cascades to related tables)
      const { error } = await supabase
        .from('processing_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      // Refresh jobs list
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    getJobFiles,
    deleteJob
  };
};