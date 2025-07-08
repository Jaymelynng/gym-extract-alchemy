import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Upload } from 'lucide-react';

interface UploadActionsProps {
  selectedFilesCount: number;
  processedFilesCount: number;
  isProcessing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onOrganizeFiles: () => void;
  onUploadFiles: () => void;
}

const UploadActions: React.FC<UploadActionsProps> = ({
  selectedFilesCount,
  processedFilesCount,
  isProcessing,
  isUploading,
  uploadProgress,
  onOrganizeFiles,
  onUploadFiles
}) => {
  return (
    <div className="flex gap-4">
      {selectedFilesCount > 0 && processedFilesCount === 0 && (
        <Button
          onClick={onOrganizeFiles}
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
              Organize with AI ({selectedFilesCount} files)
            </>
          )}
        </Button>
      )}

      {processedFilesCount > 0 && (
        <Button
          onClick={onUploadFiles}
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
  );
};

export default UploadActions;