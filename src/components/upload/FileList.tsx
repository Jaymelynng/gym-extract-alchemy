import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface FileListProps {
  files: File[];
  isProcessing: boolean;
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  isProcessing,
  isUploading,
  onRemoveFile,
  onClearAll
}) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Selected Files ({files.length})
          </h3>
          <Button 
            variant="outline" 
            onClick={onClearAll}
            disabled={isProcessing || isUploading}
          >
            Clear All
          </Button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {files.map((file, index) => (
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
                onClick={() => onRemoveFile(index)}
                disabled={isProcessing || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileList;