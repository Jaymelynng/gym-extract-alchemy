import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Zap, 
  Settings,
  Play,
  Eye,
  Sparkles,
  TrendingUp,
  Globe,
  Heart,
  CheckCircle,
  Info
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

interface TopicDetectionResultsProps {
  topics: DetectedTopic[];
  extractionPlan: string[];
  totalContent: number;
  onStartExtraction: (options: {
    autonomous: boolean;
    selectedTopics: string[];
    customRules: any;
  }) => void;
}

const TopicDetectionResults: React.FC<TopicDetectionResultsProps> = ({ 
  topics, 
  extractionPlan, 
  totalContent,
  onStartExtraction 
}) => {
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics.map(t => t.name));
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(name => name !== topicName)
        : [...prev, topicName]
    );
  };

  const handleStartExtraction = () => {
    onStartExtraction({
      autonomous: autonomousMode,
      selectedTopics,
      customRules: {} // Future enhancement
    });
  };

  const totalPages = [...new Set(topics.flatMap(t => t.pages))].length;
  const averageConfidence = Math.round(topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-primary" />
                AI Analysis Complete
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Your document has been intelligently analyzed and categorized
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{topics.length}</div>
              <div className="text-sm text-muted-foreground">Topics Found</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalPages}</div>
              <div className="text-sm text-muted-foreground">Pages Analyzed</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-accent">{totalContent}</div>
              <div className="text-sm text-muted-foreground">Items Extracted</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-gold">{averageConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold text-secondary-foreground">{extractionPlan.length}</div>
              <div className="text-sm text-muted-foreground">Output Formats</div>
            </div>
          </div>

          {/* Autonomous Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autonomous-mode"
                  checked={autonomousMode}
                  onCheckedChange={setAutonomousMode}
                />
                <Label htmlFor="autonomous-mode" className="font-medium">
                  Autonomous Mode
                </Label>
              </div>
              <Badge variant={autonomousMode ? "default" : "secondary"}>
                {autonomousMode ? "Fully Automatic" : "Manual Control"}
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? "Hide" : "Show"} Advanced
            </Button>
          </div>

          {!autonomousMode && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Manual Mode:</strong> You can select which topics to process and customize extraction settings below.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Discovered Topics
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Extraction Plan
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <Card 
                key={index} 
                className={`transition-all ${
                  !autonomousMode && !selectedTopics.includes(topic.name) 
                    ? 'opacity-50 border-dashed' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {!autonomousMode && (
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.name)}
                          onChange={() => toggleTopic(topic.name)}
                          className="rounded"
                        />
                      )}
                      <span className="text-2xl">{getTopicIcon(topic.contentType)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{topic.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(topic.confidence)}`}
                          >
                            {topic.confidence}% confident
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {topic.language.toUpperCase()}
                          </Badge>
                          <span className="text-sm">
                            {getSentimentIcon(topic.sentiment)} {topic.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {topic.pages.length} pages
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Key Concepts:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {topic.keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Pages:</span>
                      <span className="text-sm ml-2">
                        {topic.pages.slice(0, 10).join(', ')}
                        {topic.pages.length > 10 && ` +${topic.pages.length - 10} more`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI-Generated Extraction Plan
              </CardTitle>
              <p className="text-muted-foreground">
                Based on the detected topics and content patterns, here's what will be created:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extractionPlan.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  Topic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getTopicIcon(topic.contentType)}</span>
                        <span className="text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${(topic.pages.length / totalPages) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((topic.pages.length / totalPages) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['positive', 'neutral', 'negative'].map((sentiment) => {
                    const count = topics.filter(t => t.sentiment === sentiment).length;
                    const percentage = Math.round((count / topics.length) * 100);
                    
                    return (
                      <div key={sentiment} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getSentimentIcon(sentiment)}</span>
                          <span className="text-sm capitalize">{sentiment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                sentiment === 'positive' ? 'bg-green-500' :
                                sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleStartExtraction}
              className="min-w-48"
              disabled={!autonomousMode && selectedTopics.length === 0}
            >
              <Play className="h-5 w-5 mr-2" />
              {autonomousMode ? 'Start Autonomous Extraction' : `Extract ${selectedTopics.length} Topics`}
            </Button>
            
            {showAdvanced && (
              <Button variant="outline" size="lg">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </Button>
            )}
          </div>
          
          {!autonomousMode && selectedTopics.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please select at least one topic to extract
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicDetectionResults;