import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smartphone, 
  Bot, 
  FileText, 
  Award, 
  Image,
  Download
} from 'lucide-react';

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

const FeaturesGrid: React.FC = () => {
  return (
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
  );
};

export default FeaturesGrid;