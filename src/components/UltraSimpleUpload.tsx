import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileDropZone from './upload/FileDropZone';
import FileList from './upload/FileList';
import OrganizationResults from './upload/OrganizationResults';
import UploadProgress from './upload/UploadProgress';
import UploadActions from './upload/UploadActions';
import { ProcessedFile, UploadResult } from './upload/types';

interface UltraSimpleUploadProps {
  onUploadComplete?: (results: UploadResult[]) => void;
}

const UltraSimpleUpload: React.FC<UltraSimpleUploadProps> = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
    setProcessedFiles([]);
  }, []);

  const organizeFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const filesData = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      const { data, error } = await supabase.functions.invoke('organize-documents', {
        body: { files: filesData }
      });

      if (error) throw error;

      const processed = selectedFiles.map((file, index) => ({
        file,
        ...data.results[index]
      }));

      setProcessedFiles(processed);
      
      toast({
        title: "Files Organized",
        description: `${processed.length} files analyzed. ${processed.filter(f => f.isDuplicate).length} duplicates found.`,
      });

    } catch (error) {
      toast({
        title: "Organization Failed",
        description: error instanceof Error ? error.message : "Failed to organize files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadFiles = async () => {
    if (processedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const results: UploadResult[] = [];

    try {
      for (let i = 0; i < processedFiles.length; i++) {
        const processed = processedFiles[i];
        
        // Skip duplicates unless user wants to upload anyway
        if (processed.isDuplicate) {
          results.push({ skipped: true, reason: 'duplicate', original: processed });
          setUploadProgress(((i + 1) / processedFiles.length) * 100);
          continue;
        }

        // Create organized file path
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const organizedFileName = `${timestamp}-${processed.file.name}`;
        const fullPath = `${processed.folderPath}/${organizedFileName}`;

        // Upload to organized storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('organized-documents')
          .upload(fullPath, processed.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('organized-documents')
          .getPublicUrl(fullPath);

        // Generate AI summary if file is text-based
        let aiSummary = null;
        if (processed.file.type.includes('text') || processed.file.type.includes('pdf')) {
          try {
            const { data: summaryData } = await supabase.functions.invoke('generate-summary', {
              body: { fileName: processed.file.name, filePath: publicUrl }
            });
            aiSummary = summaryData?.summary;
          } catch (error) {
            console.warn('Summary generation failed:', error);
          }
        }

        // Save document metadata
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            file_name: organizedFileName,
            original_file_name: processed.file.name,
            file_path: publicUrl,
            file_size: processed.file.size,
            file_type: processed.file.type,
            file_hash: processed.hash,
            ai_category: processed.category,
            ai_tags: processed.tags,
            ai_summary: aiSummary,
            folder_path: processed.folderPath
          })
          .select()
          .single();

        if (docError) throw docError;

        results.push({
          success: true,
          document: docData,
          filePath: publicUrl,
          category: processed.category,
          tags: processed.tags
        });

        setUploadProgress(((i + 1) / processedFiles.length) * 100);
      }

      onUploadComplete?.(results);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${results.filter(r => r.success).length} files to organized storage`,
      });

      // Reset
      setSelectedFiles([]);
      setProcessedFiles([]);
      setUploadProgress(0);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Ultra-Simple Document Manager</h1>
        <p className="text-lg text-muted-foreground">
          Drag massive batches of ANY file type → AI organizes them → Upload to smart folders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk File Upload & AI Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileDropZone
            dragActive={dragActive}
            isProcessing={isProcessing}
            isUploading={isUploading}
            selectedFilesCount={selectedFiles.length}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
          />

          <FileList
            files={selectedFiles}
            isProcessing={isProcessing}
            isUploading={isUploading}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
          />

          <OrganizationResults processedFiles={processedFiles} />

          <UploadActions
            selectedFilesCount={selectedFiles.length}
            processedFilesCount={processedFiles.length}
            isProcessing={isProcessing}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onOrganizeFiles={organizeFiles}
            onUploadFiles={uploadFiles}
          />

          <UploadProgress
            isUploading={isUploading}
            progress={uploadProgress}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraSimpleUpload;