import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  Download, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  description: string;
  outputFiles?: string[];
}

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  overallProgress: number;
  isComplete: boolean;
  onDownload: (stepId: string) => void;
  onDownloadAll: () => void;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  steps,
  overallProgress,
  isComplete,
  onDownload,
  onDownloadAll
}) => {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-accent/20 bg-accent/5';
      case 'processing':
        return 'border-primary/20 bg-primary/5';
      case 'error':
        return 'border-destructive/20 bg-destructive/5';
      default:
        return 'border-muted/20 bg-muted/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Extraction Progress
            </CardTitle>
            {isComplete && (
              <Button variant="hero" onClick={onDownloadAll}>
                <Download className="h-4 w-4" />
                Download All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>{completedSteps} of {totalSteps} steps completed</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          {isComplete && (
            <div className="flex items-center space-x-2 text-accent">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">All extractions completed successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Extraction Steps</h3>
        {steps.map((step) => (
          <Card 
            key={step.id} 
            className={`transition-all duration-300 ${getStatusColor(step.status)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge 
                        variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'processing' ? 'secondary' :
                          step.status === 'error' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    
                    {step.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={step.progress} className="h-1" />
                      </div>
                    )}

                    {step.outputFiles && step.outputFiles.length > 0 && (
                      <div className="mt-2 flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {step.outputFiles.length} file{step.outputFiles.length > 1 ? 's' : ''} generated
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {step.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownload(step.id)}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProcessingStatus;