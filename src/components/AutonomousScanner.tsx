import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Image,
  Hash
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

  const phases = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'Language & Document Analysis',
      description: 'Detecting languages and document structure...'
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'AI Topic Discovery',
      description: 'Discovering topics using advanced NLP...'
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: 'Sentiment & Content Analysis',
      description: 'Analyzing emotional tone and content patterns...'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Smart Deduplication',
      description: 'Removing duplicates while preserving context...'
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Extraction Planning',
      description: 'Creating optimal extraction strategy...'
    }
  ];

  const mockTopics: DetectedTopic[] = [
    {
      name: 'Gymnastics Training',
      confidence: 95,
      keywords: ['gymnastics', 'training', 'skills', 'routines', 'balance'],
      pages: [1, 2, 5, 8, 12],
      contentType: 'gymnastics',
      sentiment: 'positive',
      language: 'en'
    },
    {
      name: 'Business Strategy',
      confidence: 87,
      keywords: ['business', 'strategy', 'growth', 'planning', 'success'],
      pages: [15, 18, 22, 25],
      contentType: 'business',
      sentiment: 'positive',
      language: 'en'
    },
    {
      name: 'Storytelling Techniques',
      confidence: 82,
      keywords: ['story', 'narrative', 'character', 'plot', 'writing'],
      pages: [30, 35, 40],
      contentType: 'storytelling',
      sentiment: 'positive',
      language: 'en'
    },
    {
      name: 'Financial Freedom',
      confidence: 78,
      keywords: ['financial', 'freedom', 'investment', 'money', 'wealth'],
      pages: [45, 48, 52],
      contentType: 'financial',
      sentiment: 'positive',
      language: 'en'
    }
  ];

  useEffect(() => {
    const runScan = async () => {
      for (let phase = 0; phase < phases.length; phase++) {
        setCurrentPhase(phase);
        setCurrentAnalysis(phases[phase].description);
        
        // Simulate phase processing
        for (let i = 0; i <= 100; i += 10) {
          setProgress((phase * 100 + i) / phases.length);
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Add discoveries gradually
          if (phase === 0 && i === 50) {
            setDetectedLanguages(['English', 'Spanish']);
          }
          if (phase === 1 && i >= 30) {
            const topicsToAdd = Math.floor((i - 30) / 20);
            setDetectedTopics(mockTopics.slice(0, topicsToAdd + 1));
          }
        }
      }
      
      // Complete the scan
      setProgress(100);
      setCurrentAnalysis('Analysis complete! Generating extraction plan...');
      
      setTimeout(() => {
        onComplete({
          topics: mockTopics,
          extractionPlan: [
            'Social media content with topic-specific hashtags',
            'AI-ready chunks preserving topic context',
            'Topic-specific databases and quick references',
            'Sentiment-optimized content for different audiences',
            'Cross-topic relationship mapping',
            'Multi-language content separation'
          ],
          totalContent: 247
        });
      }, 1000);
    };

    runScan();
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
            Autonomous AI Content Scanner
          </CardTitle>
          <p className="text-muted-foreground">
            AI is analyzing "{file.name}" to discover all topics and content automatically
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
                          {topic.language.toUpperCase()}
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
                        {topic.pages.length} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {topic.keywords.slice(0, 3).join(', ')}
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