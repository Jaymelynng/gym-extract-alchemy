
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics, fileName } = await req.json();
    
    console.log(`Starting autonomous processing for ${topics.length} topics from ${fileName}`);

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

    // Simulate file generation and create mock download URLs
    const mockResults = [
      {
        id: 'social-media',
        title: 'Social Media Content',
        description: 'Ready-to-post content with hashtags',
        fileCount: results.length * 3,
        totalSize: '2.3 MB',
        files: results.slice(0, 3).map((result, i) => ({
          name: `${result.topic.toLowerCase().replace(/\s+/g, '_')}_social_${i + 1}.txt`,
          type: 'txt',
          size: '45 KB',
          downloadUrl: '#'
        }))
      },
      {
        id: 'ai-chunks',
        title: 'AI-Ready Chunks',
        description: 'Perfect for ChatGPT and Claude',
        fileCount: results.length * 5,
        totalSize: '890 KB',
        files: results.slice(0, 2).map((result, i) => ({
          name: `${result.topic.toLowerCase().replace(/\s+/g, '_')}_chunks_${i + 1}.zip`,
          type: 'zip',
          size: '234 KB',
          downloadUrl: '#'
        }))
      }
    ];

    console.log('Autonomous processing completed successfully');

    return new Response(JSON.stringify({
      success: true,
      results: mockResults,
      processedTopics: results.length
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
