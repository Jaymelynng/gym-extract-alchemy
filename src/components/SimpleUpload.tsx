import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Upload, File, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleUploadProps {
  onUploadComplete?: (files: { original: string; summary?: string }[]) => void;
}

const SimpleUpload: React.FC<SimpleUploadProps> = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ original: string; summary?: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const uploadFile = async (file: File) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    // Upload original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('original-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('original-documents')
      .getPublicUrl(filePath);

    const result: { original: string; summary?: string } = { original: publicUrl };

    // Generate summary if requested
    if (generateSummary) {
      try {
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-summary', {
          body: { fileName: file.name, filePath: publicUrl }
        });

        if (!summaryError && summaryData?.summary) {
          // Upload summary file
          const summaryFileName = `${fileName.replace(/\.[^/.]+$/, '')}-summary.md`;
          const summaryPath = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${summaryFileName}`;
          
          const { data: summaryUploadData, error: summaryUploadError } = await supabase.storage
            .from('document-summaries')
            .upload(summaryPath, new Blob([summaryData.summary], { type: 'text/markdown' }));

          if (!summaryUploadError) {
            const { data: { publicUrl: summaryUrl } } = supabase.storage
              .from('document-summaries')
              .getPublicUrl(summaryPath);
            
            result.summary = summaryUrl;
          }
        }
      } catch (error) {
        console.warn('Summary generation failed, but file uploaded successfully');
      }
    }

    return result;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const results: { original: string; summary?: string }[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const result = await uploadFile(file);
        results.push(result);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setUploadedFiles(results);
      onUploadComplete?.(results);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${selectedFiles.length} file(s)${generateSummary ? ' with summaries' : ''}`,
      });

      // Reset form
      setSelectedFiles([]);
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
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Document Upload</h1>
        <p className="text-lg text-muted-foreground">
          Upload your documents directly to organized storage - no complex processing required
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.html,.rtf,.doc,.docx,.zip"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {dragActive ? "Drop your documents here!" : "Drag & Drop Multiple Documents"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Or click to browse files. Supports PDF, TXT, MD, HTML, RTF, DOC, DOCX, ZIP
                </p>
              </div>
              {selectedFiles.length === 0 && (
                <Button variant="outline" size="sm" className="mt-4">
                  Browse Files
                </Button>
              )}
            </div>
          </div>
            
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Selected {selectedFiles.length} file(s):
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <File className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      disabled={isUploading}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-summary"
              checked={generateSummary}
              onCheckedChange={(checked) => setGenerateSummary(checked as boolean)}
              disabled={isUploading}
            />
            <label htmlFor="generate-summary" className="text-sm">
              Generate AI summary for each document (optional)
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading files...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'Files'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Document {index + 1}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.original, '_blank')}
                      >
                        View Original
                      </Button>
                      {result.summary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(result.summary, '_blank')}
                        >
                          View Summary
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleUpload;