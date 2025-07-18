
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================================================
// TOPIC CONSOLIDATION UTILITIES
// ============================================================================

interface TopicGroup {
  mainTopic: string;
  subTopics: string[];
  contentType: string;
  sentiment: string;
  allKeywords: string[];
  totalPages: number;
}

function calculateTopicSimilarity(topic1: any, topic2: any): number {
  const keywords1 = new Set(topic1.keywords.map((k: string) => k.toLowerCase()));
  const keywords2 = new Set(topic2.keywords.map((k: string) => k.toLowerCase()));
  
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return intersection.size / union.size;
}

function consolidateTopics(topics: any[]): TopicGroup[] {
  const consolidated: TopicGroup[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < topics.length; i++) {
    if (used.has(i)) continue;
    
    const mainTopic = topics[i];
    const group: TopicGroup = {
      mainTopic: mainTopic.name,
      subTopics: [],
      contentType: mainTopic.contentType,
      sentiment: mainTopic.sentiment,
      allKeywords: [...mainTopic.keywords],
      totalPages: mainTopic.pages.length
    };
    
    // Find similar topics to group together
    for (let j = i + 1; j < topics.length; j++) {
      if (used.has(j)) continue;
      
      const otherTopic = topics[j];
      const similarity = calculateTopicSimilarity(mainTopic, otherTopic);
      
      // Group topics with >60% similarity or same content type
      if (similarity > 0.6 || mainTopic.contentType === otherTopic.contentType) {
        group.subTopics.push(otherTopic.name);
        group.allKeywords.push(...otherTopic.keywords);
        group.totalPages += otherTopic.pages.length;
        used.add(j);
      }
    }
    
    used.add(i);
    consolidated.push(group);
  }
  
  return consolidated;
}

// ============================================================================
// CONTENT GENERATION UTILITIES
// ============================================================================

interface ProcessingResult {
  topic: string;
  content: string;
  type: string;
  subTopics: string[];
  pages: number;
}

async function generateContentForTopicGroup(topicGroup: TopicGroup, jobId: string): Promise<ProcessingResult | null> {
  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst and content strategist. Create comprehensive, substantial content that provides real value. Focus on actionable insights and detailed analysis rather than superficial summaries.`
          },
          {
            role: 'user',
            content: `Create a comprehensive analysis for this topic group:
            
            Main Topic: ${topicGroup.mainTopic}
            Related Topics: ${topicGroup.subTopics.join(', ')}
            Content Type: ${topicGroup.contentType}
            Key Concepts: ${topicGroup.allKeywords.join(', ')}
            Overall Sentiment: ${topicGroup.sentiment}
            Page Coverage: ${topicGroup.totalPages} pages
            
            Generate a detailed analysis (minimum 1000 words) that includes:
            1. Executive Summary (2-3 paragraphs)
            2. Key Findings and Insights (detailed bullet points)
            3. Actionable Recommendations 
            4. Supporting Data and Context
            5. Strategic Implications
            
            Make the content substantial, specific, and actionable. Avoid generic statements.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (openAIResponse.ok) {
      const aiResult = await openAIResponse.json();
      return {
        topic: topicGroup.mainTopic,
        content: aiResult.choices[0].message.content,
        type: topicGroup.contentType,
        subTopics: topicGroup.subTopics,
        pages: topicGroup.totalPages
      };
    }
    
    console.error('OpenAI API error:', await openAIResponse.text());
    return null;
  } catch (error) {
    console.error('Error generating content for topic group:', error);
    return null;
  }
}

async function processAllTopicGroups(consolidatedTopics: TopicGroup[], jobId: string): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];
  
  for (const topicGroup of consolidatedTopics) {
    const result = await generateContentForTopicGroup(topicGroup, jobId);
    if (result) {
      results.push(result);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

// ============================================================================
// FILE PROCESSING UTILITIES
// ============================================================================

interface ContentCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface FileData {
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
}

interface CategoryResult {
  id: string;
  title: string;
  description: string;
  icon: string;
  fileCount: number;
  totalSize: string;
  files: FileData[];
}

function createFileContent(result: ProcessingResult, category: ContentCategory): string {
  if (category.id === 'analysis') {
    return `# Comprehensive Analysis: ${result.topic}

## Overview
${result.subTopics && result.subTopics.length > 0 ? 
  `This analysis covers ${result.topic} and related areas: ${result.subTopics.join(', ')}.` : 
  `This analysis focuses on ${result.topic}.`}

**Content Type:** ${result.type}
**Page Coverage:** ${result.pages || 'Multiple'} pages

---

${result.content}

---

## Document Context
- **Analysis Date:** ${new Date().toLocaleDateString()}
- **Processing Method:** Autonomous AI Analysis
- **Content Quality:** Comprehensive Review

*This analysis was generated using advanced AI to extract maximum value from your document content.*`;
  } else {
    // Executive summary
    const sections = result.content.split('\n\n');
    const summary = sections.slice(0, 3).join('\n\n');
    const keyPoints = result.content.match(/(?:^|\n)[\d•\-*]\s*.+/gm)?.slice(0, 8) || [];
    
    return `# Executive Summary: ${result.topic}

## Quick Overview
${summary}

## Key Takeaways
${keyPoints.map(point => point.trim()).join('\n')}

## Strategic Recommendations
Based on the analysis of ${result.topic}, the following actions are recommended:

${result.content.includes('recommend') || result.content.includes('suggest') ? 
  result.content.split('\n').filter(line => 
    line.toLowerCase().includes('recommend') || 
    line.toLowerCase().includes('suggest') ||
    line.toLowerCase().includes('should')
  ).slice(0, 5).join('\n') : 
  '• Review the detailed analysis for specific action items\n• Consider the strategic implications outlined in the comprehensive report\n• Evaluate implementation priorities based on organizational goals'}

---
**Summary Generated:** ${new Date().toLocaleDateString()}
**Source Document Analysis:** ${result.topic}`;
  }
}

async function uploadFileToStorage(filePath: string, fileContent: string, contentType: string): Promise<boolean> {
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('document-processing')
      .upload(filePath, new Blob([fileContent], { type: contentType }), {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error(`Failed to upload ${filePath}:`, uploadError);
      return false;
    }

    console.log(`Successfully uploaded: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return false;
  }
}

async function storeFileMetadata(jobId: string, category: ContentCategory, fileName: string, filePath: string, fileSize: string, result: ProcessingResult): Promise<boolean> {
  try {
    const { error: dbError } = await supabase
      .from('generated_content')
      .insert({
        job_id: jobId,
        category: category.id,
        title: result.topic,
        description: category.description,
        file_name: fileName,
        file_path: filePath,
        file_type: 'md',
        file_size: fileSize
      });

    if (dbError) {
      console.error(`Failed to store metadata for ${fileName}:`, dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error storing metadata for ${fileName}:`, error);
    return false;
  }
}

async function processFilesForCategory(category: ContentCategory, results: ProcessingResult[], jobId: string): Promise<CategoryResult> {
  const categoryFiles: FileData[] = [];
  let totalSizeBytes = 0;
  
  for (const result of results) {
    const fileContent = createFileContent(result, category);
    const fileName = `${result.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${category.id}.md`;
    const filePath = `${jobId}/${category.id}/${fileName}`;
    
    console.log(`Processing file: ${fileName}`);
    
    // Upload file to storage
    const uploadSuccess = await uploadFileToStorage(filePath, fileContent, 'text/markdown');
    
    if (uploadSuccess) {
      const fileSizeBytes = new Blob([fileContent]).size;
      const fileSizeKB = Math.max(1, Math.round(fileSizeBytes / 1024));
      totalSizeBytes += fileSizeBytes;

      // Store metadata in database
      const metadataSuccess = await storeFileMetadata(jobId, category, fileName, filePath, `${fileSizeKB} KB`, result);
      
      if (metadataSuccess) {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('document-processing')
          .getPublicUrl(filePath);

        categoryFiles.push({
          name: fileName,
          type: 'md',
          size: `${fileSizeKB} KB`,
          downloadUrl: publicUrl
        });
      }
    }
  }

  return {
    id: category.id,
    title: category.title,
    description: category.description,
    icon: category.icon,
    fileCount: categoryFiles.length,
    totalSize: `${Math.max(1, Math.round(totalSizeBytes / 1024))} KB`,
    files: categoryFiles
  };
}

async function generateAllFiles(results: ProcessingResult[], jobId: string): Promise<CategoryResult[]> {
  const contentCategories: ContentCategory[] = [
    { id: 'analysis', title: 'Comprehensive Analysis', description: 'Detailed insights and strategic recommendations', icon: 'FileText' },
    { id: 'executive-summary', title: 'Executive Summary', description: 'Key findings and actionable takeaways', icon: 'TrendingUp' }
  ];

  const generatedResults: CategoryResult[] = [];

  for (const category of contentCategories) {
    const categoryResult = await processFilesForCategory(category, results, jobId);
    if (categoryResult.fileCount > 0) {
      generatedResults.push(categoryResult);
    }
  }

  return generatedResults;
}

// ============================================================================
// JOB MANAGEMENT UTILITIES
// ============================================================================

async function updateJobToAutonomousMode(jobId: string): Promise<void> {
  try {
    await supabase
      .from('processing_jobs')
      .update({ autonomous_mode: true })
      .eq('id', jobId);
  } catch (error) {
    console.error('Failed to update job to autonomous mode:', error);
  }
}

async function completeJob(jobId: string, totalFiles: number): Promise<void> {
  try {
    await supabase
      .from('processing_jobs')
      .update({ 
        status: 'completed',
        total_content: totalFiles,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  } catch (error) {
    console.error('Failed to complete job:', error);
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics, fileName, jobId } = await req.json();
    
    console.log(`Starting autonomous processing for ${topics.length} topics from ${fileName}`);
    
    // Update job to autonomous mode
    if (jobId) {
      await updateJobToAutonomousMode(jobId);
    }

    // Step 1: Consolidate similar topics to reduce fragmentation
    const consolidatedTopics = consolidateTopics(topics);
    console.log(`Consolidated ${topics.length} topics into ${consolidatedTopics.length} meaningful groups`);

    // Step 2: Generate comprehensive content for each topic group
    const results = await processAllTopicGroups(consolidatedTopics, jobId);
    console.log(`Generated content for ${results.length} topic groups`);

    // Step 3: Create and store files
    const generatedResults = await generateAllFiles(results, jobId);
    console.log(`Generated ${generatedResults.length} file categories`);

    // Step 4: Complete the job
    const totalFiles = generatedResults.reduce((sum, cat) => sum + cat.fileCount, 0);
    await completeJob(jobId, totalFiles);

    console.log('Autonomous processing completed successfully');

    return new Response(JSON.stringify({
      success: true,
      results: generatedResults,
      processedTopics: results.length,
      jobId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in autonomous-process function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
