import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  dragActive: boolean;
  isProcessing: boolean;
  isUploading: boolean;
  selectedFilesCount: number;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  dragActive,
  isProcessing,
  isUploading,
  selectedFilesCount,
  onDrag,
  onDrop,
  onFileSelect
}) => {
  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        dragActive 
          ? "border-primary bg-primary/10 scale-105" 
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
      } ${isProcessing || isUploading ? "pointer-events-none opacity-50" : ""}`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      <input
        type="file"
        multiple
        onChange={onFileSelect}
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
        {selectedFilesCount === 0 && (
          <Button size="lg" className="mt-4">
            Browse Files
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;