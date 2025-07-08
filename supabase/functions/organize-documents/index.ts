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
    const { files } = await req.json();
    console.log('Processing files for organization:', files.length);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const results = [];

    for (const file of files) {
      // Generate file hash for duplicate detection
      const hash = await generateFileHash(file.name + file.size + file.type);
      
      // Check for duplicates
      const { data: existingFile } = await supabase
        .from('documents')
        .select('id, file_name, file_path')
        .eq('file_hash', hash)
        .single();

      // Use OpenAI for smart categorization
      const aiAnalysis = await analyzeFileWithAI(file, openAIApiKey);
      
      const result = {
        originalName: file.name,
        hash,
        category: aiAnalysis.category,
        tags: aiAnalysis.tags,
        folderPath: aiAnalysis.folderPath,
        isDuplicate: !!existingFile,
        duplicateInfo: existingFile ? {
          id: existingFile.id,
          name: existingFile.file_name,
          path: existingFile.file_path
        } : null
      };

      results.push(result);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in organize-documents function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFileHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function analyzeFileWithAI(file: any, apiKey: string) {
  try {
    const prompt = `Analyze this file and provide smart categorization:

File: ${file.name}
Type: ${file.type || 'unknown'}
Size: ${file.size} bytes

Based on the filename and type, determine:
1. Best category (choose from: Documents, Images, Spreadsheets, Presentations, Archives, Media, Code, Legal, Financial, Personal, Work, Educational, or suggest a better one)
2. 3-5 relevant tags
3. Suggested folder structure

Respond in JSON format:
{
  "category": "category_name",
  "tags": ["tag1", "tag2", "tag3"],
  "folderPath": "Category/Year/Month",
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a smart document organizer. Analyze files and suggest optimal categorization and folder structures.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    const analysis = JSON.parse(aiResponse);
    
    // Generate folder path with current date
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return {
      category: analysis.category || 'Documents',
      tags: analysis.tags || [],
      folderPath: `${analysis.category}/${year}/${month}`
    };
    
  } catch (error) {
    console.error('AI analysis failed, falling back to basic categorization:', error);
    // Fallback to basic categorization
    return {
      category: 'Documents',
      tags: ['unanalyzed'],
      folderPath: `Documents/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
    };
  }
}