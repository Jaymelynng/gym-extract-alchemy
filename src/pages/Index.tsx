import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import ExtractionOptions from '@/components/ExtractionOptions';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultsDownload from '@/components/ResultsDownload';
import AutonomousScanner from '@/components/AutonomousScanner';
import TopicDetectionResults from '@/components/TopicDetectionResults';
import AutonomousProcessingStatus from '@/components/AutonomousProcessingStatus';
import { 
  Zap, 
  FileText, 
  Smartphone, 
  Bot, 
  Award, 
  Image,
  Download,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import heroImage from '@/assets/gymnastics-hero.jpg';

interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  description: string;
  outputFiles?: string[];
}

interface DetectedTopic {
  name: string;
  confidence: number;
  keywords: string[];
  pages: number[];
  contentType: 'gymnastics' | 'storytelling' | 'business' | 'financial' | 'educational' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'scanning' | 'topics' | 'options' | 'processing' | 'autonomous-processing' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [useAutonomousMode, setUseAutonomousMode] = useState(true);
  const [detectedTopics, setDetectedTopics] = useState<DetectedTopic[]>([]);
  const [extractionPlan, setExtractionPlan] = useState<string[]>([]);
  const [totalContent, setTotalContent] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('scanning');
  };

  const handleScanComplete = (results: {
    topics: DetectedTopic[];
    extractionPlan: string[];
    totalContent: number;
  }) => {
    setDetectedTopics(results.topics);
    setExtractionPlan(results.extractionPlan);
    setTotalContent(results.totalContent);
    setCurrentStep('topics');
  };

  const handleTopicExtractionStart = (options: {
    autonomous: boolean;
    selectedTopics: string[];
    customRules: any;
  }) => {
    setUseAutonomousMode(options.autonomous);
    if (options.autonomous) {
      setCurrentStep('autonomous-processing');
    } else {
      setCurrentStep('options');
    }
  };

  const handleAutonomousComplete = () => {
    setCurrentStep('results');
  };

  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleStartExtraction = (optionId: string) => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Initialize processing steps based on selected options
    const steps: ProcessingStep[] = [
      {
        id: 'split-pdf',
        title: 'Splitting PDF',
        status: 'processing',
        progress: 0,
        description: 'Creating smaller PDF chunks...'
      },
      {
        id: 'extract-text',
        title: 'Extracting Text',
        status: 'pending',
        progress: 0,
        description: 'Reading all text content...'
      },
      {
        id: 'process-content',
        title: 'Processing Content',
        status: 'pending',
        progress: 0,
        description: 'Organizing and categorizing content...'
      },
      {
        id: 'generate-outputs',
        title: 'Generating Outputs',
        status: 'pending',
        progress: 0,
        description: 'Creating downloadable files...'
      }
    ];
    
    setProcessingSteps(steps);
    
    // Simulate processing with realistic timing
    simulateProcessing(steps);
  };

  const simulateProcessing = async (steps: ProcessingStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      setProcessingSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'processing' as const }
          : step
      ));

      // Simulate progress for current step
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProcessingSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress }
            : step
        ));
      }

      // Mark step as completed
      setProcessingSteps(prev => prev.map((step, index) => 
        index === i 
          ? { 
              ...step, 
              status: 'completed' as const, 
              progress: 100,
              outputFiles: [`output_${step.id}.zip`]
            }
          : step
      ));
    }

    // Processing complete
    setIsProcessing(false);
    setCurrentStep('results');
  };

  const mockResults = [
    {
      id: 'social-media',
      title: 'Social Media Content',
      description: 'Ready-to-post content with hashtags',
      icon: <Smartphone className="h-5 w-5" />,
      fileCount: 25,
      totalSize: '2.3 MB',
      files: [
        { name: 'instagram_tips_01-30.txt', type: 'txt', size: '45 KB', downloadUrl: '#' },
        { name: 'motivational_quotes.json', type: 'json', size: '23 KB', downloadUrl: '#' },
        { name: 'hashtag_suggestions.txt', type: 'txt', size: '12 KB', downloadUrl: '#' }
      ]
    },
    {
      id: 'ai-chunks',
      title: 'AI-Ready Chunks',
      description: 'Perfect for ChatGPT and Claude',
      icon: <Bot className="h-5 w-5" />,
      fileCount: 47,
      totalSize: '890 KB',
      files: [
        { name: 'chunk_0001-0020.zip', type: 'zip', size: '234 KB', downloadUrl: '#' },
        { name: 'chunk_0021-0047.zip', type: 'zip', size: '267 KB', downloadUrl: '#' },
        { name: 'chunks_metadata.json', type: 'json', size: '8 KB', downloadUrl: '#' }
      ]
    }
  ];

  const overallProgress = processingSteps.length > 0 
    ? (processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100
    : 0;

  const isComplete = processingSteps.length > 0 && processingSteps.every(s => s.status === 'completed');

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Topic-Aware Social Media",
      description: "Generate content with topic-specific hashtags and optimal engagement"
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: "Autonomous AI Analysis",
      description: "Automatically detect all topics and content types without configuration"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Intelligent Organization",
      description: "Smart content separation by topic with cross-references and relationships"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Multi-Topic Databases",
      description: "Create specialized databases for each detected topic automatically"
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "Context-Preserving Chunking",
      description: "AI chunks that maintain topic coherence across different subjects"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Zero-Decision Processing",
      description: "Complete automation from upload to organized, ready-to-use outputs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {currentStep === 'upload' && (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="relative max-w-7xl mx-auto px-4 py-20">
              <div className="text-center space-y-8">
                <Badge variant="secondary" className="mx-auto">
                  <Star className="h-3 w-3 mr-1" />
                  AI-Powered Multi-Topic Content Extractor
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Autonomous Content
                  <br />
                  <span className="text-accent">Extractor</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Upload any document and let AI automatically discover all topics, extract content, 
                  and organize everything perfectly - zero decisions needed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button variant="hero" size="xl" className="min-w-48" onClick={() => document.getElementById('file-upload')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Zap className="h-5 w-5" />
                    Start Autonomous Scan
                  </Button>
                  <Button variant="outline" size="xl">
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Intelligent Content Extraction for Any Topic
              </h2>
              <p className="text-xl text-muted-foreground">
                AI-powered analysis works with gymnastics, business, storytelling, education, and more
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div id="file-upload" className="max-w-4xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Upload Any Document</h3>
              <p className="text-lg text-muted-foreground">
                Drop your PDF and let AI automatically discover all topics and content
              </p>
            </div>
            
            <FileUpload 
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
          </div>
        </>
      )}

      {currentStep === 'scanning' && selectedFile && (
        <div className="py-12">
          <AutonomousScanner
            file={selectedFile}
            onComplete={handleScanComplete}
          />
        </div>
      )}

      {currentStep === 'topics' && (
        <div className="py-12">
          <TopicDetectionResults
            topics={detectedTopics}
            extractionPlan={extractionPlan}
            totalContent={totalContent}
            onStartExtraction={handleTopicExtractionStart}
          />
        </div>
      )}

      {currentStep === 'options' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ExtractionOptions
            onStartExtraction={handleStartExtraction}
            isProcessing={isProcessing}
            selectedOptions={selectedOptions}
            onToggleOption={handleToggleOption}
          />
        </div>
      )}

      {currentStep === 'autonomous-processing' && (
        <div className="py-12">
          <AutonomousProcessingStatus
            topics={detectedTopics}
            onComplete={handleAutonomousComplete}
          />
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ProcessingStatus
            steps={processingSteps}
            overallProgress={overallProgress}
            isComplete={isComplete}
            onDownload={(stepId) => console.log('Download step:', stepId)}
            onDownloadAll={() => console.log('Download all')}
          />
        </div>
      )}

      {currentStep === 'results' && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <ResultsDownload
            results={mockResults}
            onDownloadFile={(url, name) => console.log('Download file:', name)}
            onDownloadCategory={(id) => console.log('Download category:', id)}
            onDownloadAll={() => console.log('Download all')}
            onShare={(id) => console.log('Share category:', id)}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
