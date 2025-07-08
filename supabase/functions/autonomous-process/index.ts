
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics, fileName, jobId } = await req.json();
    
    console.log(`Starting autonomous processing for ${topics.length} topics from ${fileName}`);
    
    // Update job to autonomous mode
    if (jobId) {
      await supabase
        .from('processing_jobs')
        .update({ autonomous_mode: true })
        .eq('id', jobId);
    }

    // Generate outputs for each topic using GPT-4.1
    const results = [];

    for (const topic of topics) {
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
              content: `You are an expert content creator. Based on the topic analysis, create various output formats suitable for different uses. Generate content that would be useful for social media, AI training, documentation, etc.`
            },
            {
              role: 'user',
              content: `Create content outputs for this topic:
              Topic: ${topic.name}
              Type: ${topic.contentType}
              Keywords: ${topic.keywords.join(', ')}
              Sentiment: ${topic.sentiment}
              
              Generate:
              1. Social media content with relevant hashtags
              2. AI-ready text chunks for training
              3. Summary and key points
              4. Actionable insights`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
      });

      if (openAIResponse.ok) {
        const aiResult = await openAIResponse.json();
        results.push({
          topic: topic.name,
          content: aiResult.choices[0].message.content,
          type: topic.contentType
        });
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate and store files for each content type
    const contentCategories = [
      { id: 'social-media', title: 'Social Media Content', description: 'Ready-to-post content with hashtags', icon: 'Smartphone' },
      { id: 'ai-chunks', title: 'AI-Ready Chunks', description: 'Perfect for ChatGPT and Claude', icon: 'Bot' },
      { id: 'summaries', title: 'Topic Summaries', description: 'Concise overviews and key points', icon: 'FileText' }
    ];

    const generatedResults = [];

    for (const category of contentCategories) {
      const categoryFiles = [];
      let totalSizeBytes = 0;
      
      for (const result of results) {
        // Create file content based on category
        let fileContent = '';
        let fileExtension = 'txt';
        let contentType = 'text/plain';
        
        if (category.id === 'social-media') {
          fileContent = `Social Media Content for: ${result.topic}\n\n${result.content}\n\n#contentcreation #AI #topics #${result.type}`;
        } else if (category.id === 'ai-chunks') {
          fileContent = JSON.stringify({
            topic: result.topic,
            content: result.content,
            type: result.type,
            keywords: [],
            created_at: new Date().toISOString()
          }, null, 2);
          fileExtension = 'json';
          contentType = 'application/json';
        } else {
          const summary = result.content.substring(0, 500);
          fileContent = `Topic Summary: ${result.topic}\n\nContent Type: ${result.type}\n\nSummary:\n${summary}${result.content.length > 500 ? '...' : ''}`;
        }

        const fileName = `${result.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${category.id}.${fileExtension}`;
        const filePath = `${jobId}/${category.id}/${fileName}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('document-processing')
          .upload(filePath, new Blob([fileContent], { type: contentType }), {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError && uploadData) {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('document-processing')
            .getPublicUrl(filePath);

          const fileSizeKB = Math.round(fileContent.length / 1024);
          totalSizeBytes += fileContent.length;

          // Store metadata in database
          await supabase
            .from('generated_content')
            .insert({
              job_id: jobId,
              category: category.id,
              title: result.topic,
              description: category.description,
              file_name: fileName,
              file_path: filePath,
              file_type: fileExtension,
              file_size: `${fileSizeKB} KB`
            });

          categoryFiles.push({
            name: fileName,
            type: fileExtension,
            size: `${fileSizeKB} KB`,
            downloadUrl: publicUrl
          });
        } else {
          console.error(`Failed to upload ${fileName}:`, uploadError);
        }
      }

      if (categoryFiles.length > 0) {
        generatedResults.push({
          id: category.id,
          title: category.title,
          description: category.description,
          icon: category.icon,
          fileCount: categoryFiles.length,
          totalSize: `${Math.round(totalSizeBytes / 1024)} KB`,
          files: categoryFiles
        });
      }
    }

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
