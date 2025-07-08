export interface ProcessedFile {
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

export interface UploadResult {
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  original?: ProcessedFile;
  document?: any;
  filePath?: string;
  category?: string;
  tags?: string[];
}