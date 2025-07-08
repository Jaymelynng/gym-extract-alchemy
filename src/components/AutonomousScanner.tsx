
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Zap, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  Globe,
  Heart,
  TrendingUp,
  FileText,
  Hash,
  AlertCircle
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

interface AutonomousScannerProps {
  file: File;
  onComplete: (results: {
    topics: DetectedTopic[];
    extractionPlan: string[];
    totalContent: number;
  }) => void;
}

const AutonomousScanner: React.FC<AutonomousScannerProps> = ({ file, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [detectedTopics, setDetectedTopics] = useState<DetectedTopic[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const phases = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'File Processing',
      description: 'Reading and extracting content...'
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'AI Analysis',
      description: 'GPT-4.1 analyzing content structure...'
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'Topic Discovery',
      description: 'Identifying topics and themes...'
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: 'Content Classification',
      description: 'Analyzing sentiment and content type...'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Planning Extraction',
      description: 'Creating optimal extraction strategy...'
    }
  ];

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setError(null);
        
        // Phase 1: File Processing
        setCurrentPhase(0);
        setCurrentAnalysis('Uploading and processing file...');
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        // Phase 2: AI Analysis
        setCurrentPhase(1);
        setCurrentAnalysis('GPT-4.1 analyzing document content...');
        setProgress(30);

        const { data, error: apiError } = await supabase.functions.invoke('process-document', {
          body: formData,
        });

        if (apiError) {
          throw new Error(`Analysis failed: ${apiError.message}`);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        // Phase 3: Topic Discovery
        setCurrentPhase(2);
        setCurrentAnalysis('Discovering topics and themes...');
        setProgress(50);

        // Simulate gradual topic discovery
        if (data.topics && data.topics.length > 0) {
          for (let i = 0; i < data.topics.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDetectedTopics(data.topics.slice(0, i + 1));
            setProgress(50 + (i / data.topics.length) * 20);
          }
        }

        // Phase 4: Content Classification
        setCurrentPhase(3);
        setCurrentAnalysis('Analyzing sentiment and content patterns...');
        setProgress(75);

        if (data.languages) {
          setDetectedLanguages(data.languages);
        }

        // Phase 5: Planning
        setCurrentPhase(4);
        setCurrentAnalysis('Creating extraction plan...');
        setProgress(90);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Complete
        setProgress(100);
        setCurrentAnalysis('Analysis complete!');

        // Pass results to parent
        onComplete({
          topics: data.topics || [],
          extractionPlan: data.extractionPlan || [
            'AI-ready content chunks',
            'Topic-specific summaries',
            'Social media content',
            'Keyword databases'
          ],
          totalContent: data.totalContent || 0
        });

      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setCurrentAnalysis('Analysis failed - please try again');
      }
    };

    runAnalysis();
  }, [file, onComplete]);

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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 75) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            AI Document Analysis
          </CardTitle>
          <p className="text-muted-foreground">
            GPT-4.1 is analyzing "{file.name}" to discover topics and extract content
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Analysis Error:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 animate-pulse" />
              {currentAnalysis}
            </p>
          </div>

          {/* Phase Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  index < currentPhase 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : index === currentPhase
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {index < currentPhase ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    phase.icon
                  )}
                  <span className="text-xs font-medium">{phase.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detected Languages */}
          {detectedLanguages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Detected Languages
              </h4>
              <div className="flex gap-2">
                {detectedLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Topic Discovery */}
          {detectedTopics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Topics Discovered ({detectedTopics.length})
              </h4>
              <div className="grid gap-3">
                {detectedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card animate-in slide-in-from-left-5"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTopicIcon(topic.contentType)}</span>
                        <span className="font-medium">{topic.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {topic.language?.toUpperCase() || 'EN'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(topic.confidence)}`} />
                        <span className="text-xs text-muted-foreground">
                          {topic.confidence}% confident
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {topic.pages?.length || 1} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {topic.keywords?.slice(0, 3).join(', ') || 'analyzing...'}
                      </span>
                      <Badge 
                        variant={topic.sentiment === 'positive' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {topic.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousScanner;
