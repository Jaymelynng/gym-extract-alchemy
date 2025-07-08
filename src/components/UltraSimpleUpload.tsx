import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessedFile {
  file: File;
  originalName: string;
  hash: string;
  category: string;
  tags: string[];
  folderPath: string;
  isDuplicate: boolean;
  duplicateInfo?: {
    id: string;
    name: string;
    path: string;
  };
}

interface UltraSimpleUploadProps {
  onUploadComplete?: (results: any[]) => void;
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
    const results = [];

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

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedFiles(prev => prev.filter((_, i) => i !== index));
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
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? "border-primary bg-primary/10 scale-105" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
            } ${isProcessing || isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing || isUploading}
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="p-6 rounded-full bg-primary/10">
                <Upload className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">
                  {dragActive ? "Drop ALL your files here!" : "Drag & Drop MASSIVE batches"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  ANY file type, ANY size. AI will organize everything into smart folders. 
                  No file type restrictions - just drop everything!
                </p>
              </div>
              {selectedFiles.length === 0 && (
                <Button size="lg" className="mt-4">
                  Browse Files
                </Button>
              )}
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFiles([]);
                      setProcessedFiles([]);
                    }}
                    disabled={isProcessing || isUploading}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type || 'Unknown type'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isProcessing || isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Organization Results */}
          {processedFiles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">AI Organization Results</h3>
                <div className="space-y-3">
                  {processedFiles.map((processed, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{processed.originalName}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            📁 {processed.folderPath}/{processed.originalName}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary">{processed.category}</Badge>
                            {processed.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        {processed.isDuplicate && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Duplicate</span>
                          </div>
                        )}
                      </div>
                      {processed.isDuplicate && processed.duplicateInfo && (
                        <div className="mt-2 p-2 bg-amber-50 rounded text-sm">
                          Duplicate of: {processed.duplicateInfo.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {selectedFiles.length > 0 && processedFiles.length === 0 && (
              <Button
                onClick={organizeFiles}
                disabled={isProcessing}
                size="lg"
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI Organizing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Organize with AI ({selectedFiles.length} files)
                  </>
                )}
              </Button>
            )}

            {processedFiles.length > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                size="lg"
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... ({uploadProgress.toFixed(0)}%)
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload to Organized Folders
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files to organized storage...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraSimpleUpload;