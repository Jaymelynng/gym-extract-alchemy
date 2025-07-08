import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UltraSimpleUpload from '@/components/UltraSimpleUpload';
import DocumentBrowser from '@/components/DocumentBrowser';
import { Upload, Search } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadComplete = (results: any[]) => {
    console.log('Upload completed:', results);
    // Switch to browser tab to show results
    setActiveTab('browse');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ultra-Simple Document Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered document organization. Drop massive batches of ANY file type → 
            AI automatically organizes, categorizes, and stores everything in smart folders.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload & Organize
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UltraSimpleUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="browse">
            <DocumentBrowser />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
