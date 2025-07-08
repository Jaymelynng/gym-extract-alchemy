import React from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import SimpleUpload from '@/components/SimpleUpload';

const Index = () => {
  const handleUploadComplete = (files: { original: string; summary?: string }[]) => {
    console.log('Files uploaded:', files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <HeroSection />
      <FeaturesGrid />
      <SimpleUpload onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default Index;
