import React from 'react';
import { Smartphone, Bot } from 'lucide-react';

export const mockResults = [
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