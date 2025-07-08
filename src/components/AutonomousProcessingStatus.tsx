
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  Sparkles,
  FileText,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface DetectedTopic {
  name: string;
  confidence: number;
  keywords: string[];
  pages: number[];
  contentType: 'gymnastics' | 'storytelling' | 'business' | 'financial' | 'educational' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

interface AutonomousProcessingStatusProps {
  topics: DetectedTopic[];
  jobId?: string;
  onComplete: (results: any[]) => void;
}

const AutonomousProcessingStatus: React.FC<AutonomousProcessingStatusProps> = ({ 
  topics, 
  jobId,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processedTopics, setProcessedTopics] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Initializing AI processing pipeline',
    'Generating topic-specific content',
    'Creating social media formats',
    'Building AI-ready chunks',
    'Optimizing for different platforms',
    'Finalizing outputs and packaging'
  ];

  useEffect(() => {
    const processTopics = async () => {
      try {
        setError(null);
        
        // Step 1: Initialize
        setCurrentStep(0);
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Process topics
        setCurrentStep(1);
        setProgress(20);

        const { data, error: apiError } = await supabase.functions.invoke('autonomous-process', {
          body: { 
            topics: topics,
            fileName: 'document.pdf', // Would be actual filename in real implementation
            jobId
          }
        });

        if (apiError) {
          throw new Error(`Processing failed: ${apiError.message}`);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        // Step 3-5: Show progress through remaining steps
        for (let step = 2; step < steps.length - 1; step++) {
          setCurrentStep(step);
          setProgress(20 + (step / steps.length) * 60);
          
          // Simulate processing individual topics
          const topicsToShow = Math.min(step - 1, topics.length);
          setProcessedTopics(topics.slice(0, topicsToShow).map(t => t.name));
          
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Step 6: Finalize
        setCurrentStep(steps.length - 1);
        setProgress(95);
        setProcessedTopics(topics.map(t => t.name));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Complete
        setProgress(100);
        setIsComplete(true);
        
        setTimeout(() => {
          onComplete(data.results || []);
        }, 1500);

      } catch (err) {
        console.error('Processing error:', err);
        setError(err instanceof Error ? err.message : 'Processing failed');
      }
    };

    processTopics();
  }, [topics, onComplete]);

  const getTopicIcon = (contentType: string) => {
    switch (contentType) {
      case 'gymnastics': return '🏅';
      case 'business': return '💼';
      case 'storytelling': return '📚';
      case 'financial': return '💰';
      case 'educational': return '🎓';
      default: return '📄';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            Autonomous Processing
          </CardTitle>
          <p className="text-muted-foreground">
            AI is creating optimized content formats from your {topics.length} detected topics
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Processing Error:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Processing Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {isComplete ? (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Processing complete! Redirecting to results...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {steps[currentStep]}
              </p>
            )}
          </div>

          {/* Step Progress */}
          <div className="space-y-2">
            <h4 className="font-medium">Processing Steps</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    index < currentStep 
                      ? 'bg-green-50 text-green-700' 
                      : index === currentStep
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : index === currentStep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Processed Topics */}
          {processedTopics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Topics Processed ({processedTopics.length}/{topics.length})
              </h4>
              <div className="grid gap-2">
                {processedTopics.map((topicName, index) => {
                  const topic = topics.find(t => t.name === topicName);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-lg">{getTopicIcon(topic?.contentType || 'other')}</span>
                      <div className="flex-1">
                        <span className="font-medium">{topicName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {topic?.contentType || 'other'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Content generated successfully
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview of outputs being generated */}
          {currentStep >= 2 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generated Outputs Preview
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Social media content with hashtags ({processedTopics.length * 3} files)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>AI-ready text chunks ({processedTopics.length * 5} chunks)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Topic summaries and insights ({processedTopics.length} files)</span>
                </div>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  All content generated successfully!
                </span>
              </div>
              <p className="text-sm text-green-700">
                Your {topics.length} topics have been processed into multiple output formats ready for download.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousProcessingStatus;
