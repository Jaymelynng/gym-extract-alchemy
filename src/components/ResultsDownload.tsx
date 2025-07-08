import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Image, 
  Smartphone, 
  Bot, 
  Award,
  Clock,
  FolderOpen,
  Share2
} from 'lucide-react';

interface ExtractionResult {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fileCount: number;
  totalSize: string;
  files: Array<{
    name: string;
    type: string;
    size: string;
    downloadUrl: string;
  }>;
}

interface ResultsDownloadProps {
  results: ExtractionResult[];
  onDownloadFile: (fileUrl: string, fileName: string) => void;
  onDownloadCategory: (categoryId: string) => void;
  onDownloadAll: () => void;
  onShare: (categoryId: string) => void;
}

const ResultsDownload: React.FC<ResultsDownloadProps> = ({
  results,
  onDownloadFile,
  onDownloadCategory,
  onDownloadAll,
  onShare
}) => {
  const totalFiles = results.reduce((sum, result) => sum + result.fileCount, 0);
  const totalCategories = results.length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'txt':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'json':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'jpg':
      case 'png':
        return <Image className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Extraction Complete! 🎉</CardTitle>
              <p className="opacity-90">
                {totalFiles} files extracted across {totalCategories} categories
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={onDownloadAll}
              className="bg-white/20 hover:bg-white/30"
            >
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {result.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {result.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onShare(result.id)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onDownloadCategory(result.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <FolderOpen className="h-3 w-3" />
                    <span>{result.fileCount} files</span>
                  </span>
                  <span>{result.totalSize}</span>
                </div>
              </div>

              {/* File List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getTypeIcon(file.type)}
                      <span className="text-sm font-medium truncate">
                        {file.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {file.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {file.size}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onDownloadFile(file.downloadUrl, file.name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                Use your extracted content for training plans, social media, or AI assistance
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Smartphone className="h-3 w-3" />
                Share Tips
              </Button>
              <Button variant="outline" size="sm">
                <Bot className="h-3 w-3" />
                Upload to AI
              </Button>
              <Button variant="outline" size="sm">
                <Award className="h-3 w-3" />
                View Skills
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDownload;