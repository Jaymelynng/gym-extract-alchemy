import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Bot, 
  FileText, 
  Award, 
  Image, 
  Search,
  Clock,
  Download
} from 'lucide-react';

interface ExtractionOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  estimatedTime: string;
  outputFormat: string;
}

interface ExtractionOptionsProps {
  onStartExtraction: (optionId: string) => void;
  isProcessing: boolean;
  selectedOptions: string[];
  onToggleOption: (optionId: string) => void;
}

const extractionOptions: ExtractionOption[] = [
  {
    id: 'social-media',
    title: 'Social Media Content',
    description: 'Extract bite-sized tips, quotes, and ready-to-post content',
    icon: <Smartphone className="h-5 w-5" />,
    features: ['Instagram captions', 'Hashtag suggestions', 'Motivational quotes', 'Quick tips'],
    estimatedTime: '2-3 min',
    outputFormat: 'TXT, JSON'
  },
  {
    id: 'ai-chunks',
    title: 'AI-Ready Chunks',
    description: 'Split into perfect-sized chunks for ChatGPT and Claude',
    icon: <Bot className="h-5 w-5" />,
    features: ['3000-char chunks', 'Context preservation', 'Metadata included', 'Upload ready'],
    estimatedTime: '1-2 min',
    outputFormat: 'TXT, JSON'
  },
  {
    id: 'small-pdfs',
    title: 'Small PDFs',
    description: 'Split into uploadable 10MB chunks for any platform',
    icon: <FileText className="h-5 w-5" />,
    features: ['10MB max size', 'Platform ready', 'Numbered parts', 'Index included'],
    estimatedTime: '30 sec',
    outputFormat: 'PDF'
  },
  {
    id: 'skills-database',
    title: 'Skills Database',
    description: 'Comprehensive gymnastics skills reference and lookup',
    icon: <Award className="h-5 w-5" />,
    features: ['All apparatus', 'Skill progressions', 'Page references', 'Searchable index'],
    estimatedTime: '3-4 min',
    outputFormat: 'JSON, TXT'
  },
  {
    id: 'training-plans',
    title: 'Training Content',
    description: 'Organize warm-ups, conditioning, and structured plans',
    icon: <Clock className="h-5 w-5" />,
    features: ['Warm-up routines', 'Conditioning plans', 'Skill progressions', 'Weekly schedules'],
    estimatedTime: '2-3 min',
    outputFormat: 'JSON, PDF'
  },
  {
    id: 'images-diagrams',
    title: 'Images & Diagrams',
    description: 'Extract all visual content and create organized library',
    icon: <Image className="h-5 w-5" />,
    features: ['High-res extraction', 'Automatic naming', 'Page references', 'Thumbnail gallery'],
    estimatedTime: '1-2 min',
    outputFormat: 'JPG, PNG'
  }
];

const ExtractionOptions: React.FC<ExtractionOptionsProps> = ({
  onStartExtraction,
  isProcessing,
  selectedOptions,
  onToggleOption
}) => {
  const handleSelectAll = () => {
    extractionOptions.forEach(option => {
      if (!selectedOptions.includes(option.id)) {
        onToggleOption(option.id);
      }
    });
  };

  const handleStartExtraction = () => {
    if (selectedOptions.length > 0) {
      onStartExtraction('all-selected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose Extraction Methods</h2>
          <p className="text-muted-foreground">Select what you want to extract from your gymnastics PDF</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleSelectAll}
            disabled={isProcessing}
          >
            Select All
          </Button>
          <Button 
            variant="hero" 
            size="lg"
            onClick={handleStartExtraction}
            disabled={selectedOptions.length === 0 || isProcessing}
          >
            <Download className="h-4 w-4" />
            Extract Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extractionOptions.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-card ${
              selectedOptions.includes(option.id) 
                ? 'ring-2 ring-primary shadow-card' 
                : 'hover:shadow-md'
            }`}
            onClick={() => !isProcessing && onToggleOption(option.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {option.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </div>
                {selectedOptions.includes(option.id) && (
                  <Badge variant="default" className="bg-accent">
                    Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{option.description}</p>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {option.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{option.estimatedTime}</span>
                </span>
                <span>{option.outputFormat}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedOptions.length} extraction method{selectedOptions.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated time: 5-10 minutes total
                </p>
              </div>
              <Button 
                variant="hero" 
                onClick={handleStartExtraction}
                disabled={isProcessing}
              >
                Start Extraction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExtractionOptions;