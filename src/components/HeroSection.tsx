import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import heroImage from '@/assets/gymnastics-hero.jpg';

const HeroSection: React.FC = () => {
  const scrollToUpload = () => {
    document.getElementById('file-upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
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
            <Button variant="hero" size="xl" className="min-w-48" onClick={scrollToUpload}>
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
  );
};

export default HeroSection;