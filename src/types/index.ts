export interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  description: string;
  outputFiles?: string[];
}

export interface DetectedTopic {
  name: string;
  confidence: number;
  keywords: string[];
  pages: number[];
  contentType: 'gymnastics' | 'storytelling' | 'business' | 'financial' | 'educational' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

export interface ExtractionOptions {
  autonomous: boolean;
  selectedTopics: string[];
  customRules: any;
}

export type AppStep = 'upload' | 'scanning' | 'topics' | 'options' | 'processing' | 'autonomous-processing' | 'results';