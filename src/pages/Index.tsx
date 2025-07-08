import React, { useState } from 'react';
import ExtractionOptions from '@/components/ExtractionOptions';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultsDownload from '@/components/ResultsDownload';
import AutonomousScanner from '@/components/AutonomousScanner';
import TopicDetectionResults from '@/components/TopicDetectionResults';
import AutonomousProcessingStatus from '@/components/AutonomousProcessingStatus';
import HeroSection from '@/components/HeroSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import UploadSection from '@/components/UploadSection';
import JobHistory from '@/components/JobHistory';
import { useProcessingSteps } from '@/hooks/useProcessingSteps';
import { DetectedTopic, ExtractionOptions as ExtractionOptionsType, AppStep } from '@/types';
import { mockResults } from '@/data/mockResults';


const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAutonomousMode, setUseAutonomousMode] = useState(true);
  const [detectedTopics, setDetectedTopics] = useState<DetectedTopic[]>([]);
  const [extractionPlan, setExtractionPlan] = useState<string[]>([]);
  const [totalContent, setTotalContent] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const {
    processingSteps,
    initializeSteps,
    simulateProcessing,
    overallProgress,
    isComplete
  } = useProcessingSteps();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('scanning');
  };

  const handleScanComplete = (results: {
    topics: DetectedTopic[];
    extractionPlan: string[];
    totalContent: number;
    jobId?: string;
  }) => {
    setDetectedTopics(results.topics);
    setExtractionPlan(results.extractionPlan);
    setTotalContent(results.totalContent);
    setCurrentJobId(results.jobId || null);
    setCurrentStep('topics');
  };

  const handleTopicExtractionStart = (options: ExtractionOptionsType) => {
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
    
    const steps = initializeSteps();
    simulateProcessing(steps);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setCurrentStep('results');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {currentStep === 'upload' && (
        <>
          <HeroSection />
          <FeaturesGrid />
          <UploadSection 
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />
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
            jobId={currentJobId || undefined}
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
            onDownloadAll={handleProcessingComplete}
          />
        </div>
      )}

      {currentStep === 'results' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          <ResultsDownload
            results={mockResults}
            onDownloadFile={(url, name) => console.log('Download file:', name)}
            onDownloadCategory={(id) => console.log('Download category:', id)}
            onDownloadAll={() => console.log('Download all')}
            onShare={(id) => console.log('Share category:', id)}
          />
          <JobHistory />
        </div>
      )}
    </div>
  );
};

export default Index;
