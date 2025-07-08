import React from 'react';
import FileUpload from '@/components/FileUpload';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect, isProcessing }) => {
  return (
    <div id="file-upload" className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-4">Upload Any Document</h3>
        <p className="text-lg text-muted-foreground">
          Drop your PDF and let AI automatically discover all topics and content
        </p>
      </div>
      
      <FileUpload 
        onFileSelect={onFileSelect}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default UploadSection;