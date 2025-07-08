import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  Download,
  Eye,
  Sparkles,
  Globe,
  Heart,
  TrendingUp,
  FileText,
  Hash,
  ArrowRight,
  Copy
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

interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  description: string;
  topicSpecific?: string;
  outputFiles?: string[];
  insights?: string[];
}

interface AutonomousProcessingStatusProps {
  topics: DetectedTopic[];
  onComplete: () => void;
}

const AutonomousProcessingStatus: React.FC<AutonomousProcessingStatusProps> = ({ 
  topics, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [currentInsights, setCurrentInsights] = useState<string[]>([]);

  const createProcessingSteps = () => {
    const baseSteps: ProcessingStep[] = [
      {
        id: 'language-separation',
        title: 'Multi-Language Content Separation',
        status: 'pending',
        progress: 0,
        description: 'Separating content by detected languages...',
        insights: []
      },
      {
        id: 'sentiment-optimization',
        title: 'Sentiment-Based Content Optimization',
        status: 'pending',
        progress: 0,
        description: 'Optimizing content based on emotional tone...',
        insights: []
      },
      {
        id: 'duplicate-detection',
        title: 'Smart Duplicate Detection & Merging',
        status: 'pending',
        progress: 0,
        description: 'Identifying and intelligently handling duplicate content...',
        insights: []
      }
    ];

    // Add topic-specific steps
    topics.forEach(topic => {
      baseSteps.push({
        id: `topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${topic.name} Content Processing`,
        status: 'pending',
        progress: 0,
        description: `Extracting and organizing ${topic.name.toLowerCase()} content...`,
        topicSpecific: topic.name,
        insights: []
      });
    });

    baseSteps.push(
      {
        id: 'cross-topic-mapping',
        title: 'Cross-Topic Relationship Mapping',
        status: 'pending',
        progress: 0,
        description: 'Finding connections between different topics...',
        insights: []
      },
      {
        id: 'social-generation',
        title: 'Social Media Content Generation',
        status: 'pending',
        progress: 0,
        description: 'Creating topic-specific social media posts...',
        insights: []
      },
      {
        id: 'ai-chunking',
        title: 'AI-Optimized Content Chunking',
        status: 'pending',
        progress: 0,
        description: 'Creating AI-ready chunks with preserved context...',
        insights: []
      },
      {
        id: 'database-creation',
        title: 'Topic-Specific Database Creation',
        status: 'pending',
        progress: 0,
        description: 'Building searchable databases for each topic...',
        insights: []
      },
      {
        id: 'output-organization',
        title: 'Intelligent Output Organization',
        status: 'pending',
        progress: 0,
        description: 'Organizing all outputs for maximum usability...',
        insights: []
      }
    );

    return baseSteps;
  };

  useEffect(() => {
    const processingSteps = createProcessingSteps();
    setSteps(processingSteps);

    const runProcessing = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(i);
        
        // Update step to processing
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing' as const } : step
        ));

        // Simulate processing with insights
        const mockInsights = generateMockInsights(processingSteps[i]);
        
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setSteps(prev => prev.map((step, index) => 
            index === i ? { 
              ...step, 
              progress,
              insights: progress >= 60 ? mockInsights : []
            } : step
          ));

          if (progress >= 60 && mockInsights.length > 0) {
            setCurrentInsights(mockInsights);
          }
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => 
          index === i ? { 
            ...step, 
            status: 'completed' as const, 
            progress: 100,
            outputFiles: generateOutputFiles(processingSteps[i])
          } : step
        ));

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setTimeout(() => {
        onComplete();
      }, 1000);
    };

    runProcessing();
  }, [topics, onComplete]);

  const generateMockInsights = (step: ProcessingStep): string[] => {
    switch (step.id) {
      case 'language-separation':
        return [
          'Found content in English and Spanish',
          'Separated 85% English, 15% Spanish content',
          'Maintained topic coherence across languages'
        ];
      case 'sentiment-optimization':
        return [
          'Identified 78% positive, 18% neutral, 4% negative content',
          'Optimized hashtags for positive engagement',
          'Created motivational content variants'
        ];
      case 'duplicate-detection':
        return [
          'Found 12 instances of duplicate concepts',
          'Merged similar content while preserving context',
          'Reduced redundancy by 23%'
        ];
      case 'cross-topic-mapping':
        return [
          'Found 15 cross-topic connections',
          'Linked business concepts to storytelling techniques',
          'Created relationship maps between topics'
        ];
      case 'social-generation':
        return [
          `Generated ${45 + Math.floor(Math.random() * 20)} social media posts`,
          'Created topic-specific hashtag sets',
          'Optimized for different platforms'
        ];
      case 'ai-chunking':
        return [
          `Created ${Math.floor(Math.random() * 30) + 20} AI-ready chunks`,
          'Preserved topic context across chunks',
          'Optimized for 4K token limits'
        ];
      default:
        if (step.topicSpecific) {
          return [
            `Extracted ${Math.floor(Math.random() * 50) + 30} items`,
            'Created topic-specific reference guides',
            'Optimized content organization'
          ];
        }
        return [
          'Processing completed successfully',
          'All outputs generated and organized',
          'Ready for download and use'
        ];
    }
  };

  const generateOutputFiles = (step: ProcessingStep): string[] => {
    if (step.topicSpecific) {
      return [
        `${step.topicSpecific.toLowerCase()}_content.zip`,
        `${step.topicSpecific.toLowerCase()}_database.json`,
        `${step.topicSpecific.toLowerCase()}_quick_ref.txt`
      ];
    }
    
    switch (step.id) {
      case 'social-generation':
        return ['social_media_posts.zip', 'hashtag_library.json'];
      case 'ai-chunking':
        return ['ai_ready_chunks.zip', 'chunk_metadata.json'];
      case 'database-creation':
        return ['master_database.json', 'search_index.json'];
      default:
        return [`${step.id}_output.zip`];
    }
  };

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

  const overallProgress = steps.length > 0 
    ? (steps.filter(s => s.status === 'completed').length / steps.length) * 100
    : 0;

  const isComplete = steps.length > 0 && steps.every(s => s.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            Autonomous Content Processing
          </CardTitle>
          <p className="text-muted-foreground">
            AI is intelligently processing your content across all detected topics
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Processing Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`transition-all ${
              step.status === 'completed' 
                ? 'border-green-200 bg-green-50' 
                : step.status === 'processing'
                ? 'border-primary/30 bg-primary/5 shadow-md'
                : 'border-border'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : step.status === 'processing'
                      ? 'bg-primary text-primary-foreground animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === 'processing' ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {step.title}
                      {step.topicSpecific && (
                        <Badge variant="outline" className="text-xs">
                          {topics.find(t => t.name === step.topicSpecific)?.contentType}
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {step.status === 'processing' && (
                  <div className="text-right">
                    <div className="text-sm font-medium">{step.progress}%</div>
                    <Progress value={step.progress} className="w-20 h-2 mt-1" />
                  </div>
                )}
              </div>

              {/* Insights */}
              {step.insights && step.insights.length > 0 && (
                <div className="mb-3 p-3 bg-background rounded-lg border">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Live Insights
                  </h4>
                  <div className="space-y-1">
                    {step.insights.map((insight, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output Files */}
              {step.outputFiles && step.outputFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {step.outputFiles.map((file, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {file}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Insights Panel */}
      {currentInsights.length > 0 && !isComplete && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Real-Time Processing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {currentInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-sm animate-in slide-in-from-left-5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TrendingUp className="h-4 w-4 text-accent" />
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Actions */}
      {isComplete && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Processing Complete!
            </h3>
            <p className="text-green-700 mb-4">
              Your content has been intelligently processed and organized across all {topics.length} topics
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={onComplete} size="lg">
                <Download className="h-5 w-5 mr-2" />
                View Results
              </Button>
              <Button variant="outline" size="lg">
                <Copy className="h-5 w-5 mr-2" />
                Download All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousProcessingStatus;