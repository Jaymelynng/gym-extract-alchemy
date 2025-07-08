import React from 'react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ isUploading, progress }) => {
  if (!isUploading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Uploading files to organized storage...</span>
        <span>{progress.toFixed(0)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
};

export default UploadProgress;