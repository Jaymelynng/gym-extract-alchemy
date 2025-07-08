import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, className }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const supportedTypes = [
        'application/pdf',
        'text/plain',
        'text/markdown',
        'text/html',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/rtf',
        'application/rtf',
        'application/zip',
        'application/x-zip-compressed'
      ];
      
      if (supportedTypes.includes(file.type) || 
          file.name.toLowerCase().endsWith('.md') || 
          file.name.toLowerCase().endsWith('.txt') ||
          file.name.toLowerCase().endsWith('.html') ||
          file.name.toLowerCase().endsWith('.rtf') ||
          file.name.toLowerCase().endsWith('.zip')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-8">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
            dragActive 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
            isProcessing && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md,.html,.rtf,.doc,.docx,.zip"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center space-y-4">
            {selectedFile ? (
              <>
                <div className="p-3 rounded-full bg-accent/20">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  {isProcessing ? (
                    <div className="flex items-center space-x-2 text-primary">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-accent">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Ready to extract</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Drop your documents here</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Or click to browse files. Supports individual documents or ZIP files for batch processing.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-4">
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;