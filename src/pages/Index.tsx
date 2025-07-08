import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import ExtractionOptions from '@/components/ExtractionOptions';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultsDownload from '@/components/ResultsDownload';
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

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'options' | 'processing' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('options');
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
      title: "Social Media Ready",
      description: "Extract bite-sized tips and quotes perfect for Instagram and Twitter"
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI-Optimized",
      description: "Split content into perfect chunks for ChatGPT and Claude processing"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Smart Splitting",
      description: "Break large PDFs into uploadable 10MB chunks for any platform"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Skills Database",
      description: "Build comprehensive gymnastics skills reference with progressions"
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "Visual Content",
      description: "Extract all diagrams, images, and visual training materials"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Multiple Formats",
      description: "Get your content in PDF, TXT, JSON, and image formats"
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
                  Swiss Army Knife for Gymnastics Content
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Gymnastics Content
                  <br />
                  <span className="text-accent">Extractor</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Transform your massive gymnastics PDFs into bite-sized, AI-ready, 
                  social media perfect content in minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button variant="hero" size="xl" className="min-w-48">
                    <Zap className="h-5 w-5" />
                    Start Extracting
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
                Everything You Need in One Tool
              </h2>
              <p className="text-xl text-muted-foreground">
                Extract maximum value from your gymnastics documentation
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
          <div className="max-w-4xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Upload Your Gymnastics PDF</h3>
              <p className="text-lg text-muted-foreground">
                Drop your gymnastics manual, training guide, or documentation to get started
              </p>
            </div>
            
            <FileUpload 
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
          </div>
        </>
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
