import { useState } from 'react';
import { ProcessingStep } from '@/types';

export const useProcessingSteps = () => {
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

  const initializeSteps = () => {
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
    return steps;
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
  };

  const overallProgress = processingSteps.length > 0 
    ? (processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100
    : 0;

  const isComplete = processingSteps.length > 0 && processingSteps.every(s => s.status === 'completed');

  return {
    processingSteps,
    setProcessingSteps,
    initializeSteps,
    simulateProcessing,
    overallProgress,
    isComplete
  };
};