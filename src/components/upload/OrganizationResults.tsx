import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

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

interface OrganizationResultsProps {
  processedFiles: ProcessedFile[];
}

const OrganizationResults: React.FC<OrganizationResultsProps> = ({ processedFiles }) => {
  if (processedFiles.length === 0) return null;

  return (
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
  );
};

export default OrganizationResults;