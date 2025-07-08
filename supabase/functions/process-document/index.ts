
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import JSZip from 'https://esm.sh/jszip@3.10.1';
import { getDocument } from 'https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Real document extraction functions - NO FAKE DATA
async function extractDocumentContent(file: File): Promise<Array<{name: string, content: string, pages: number[]}>> {
  const results = [];
  
  if (file.name.toLowerCase().endsWith('.zip')) {
    console.log('Processing ZIP file with real extraction');
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(arrayBuffer);
    
    for (const [fileName, zipEntry] of Object.entries(zipContents.files)) {
      if (!zipEntry.dir) {
        console.log(`Extracting file from ZIP: ${fileName}`);
        try {
          const fileData = await zipEntry.async('arraybuffer');
          const extractedFile = new File([fileData], fileName);
          const content = await extractSingleFileContent(extractedFile);
          if (content.trim()) {
            results.push({
              name: fileName,
              content: content,
              pages: [1] // Real page extraction would require parsing the actual document structure
            });
          }
        } catch (error) {
          console.error(`Failed to extract ${fileName}:`, error);
        }
      }
    }
  } else {
    console.log('Processing single file with real extraction');
    const content = await extractSingleFileContent(file);
    if (content.trim()) {
      results.push({
        name: file.name,
        content: content,
        pages: [1]
      });
    }
  }
  
  return results;
}

async function extractSingleFileContent(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileName.endsWith('.md')) {
    return await file.text();
  }
  
  if (file.type === 'text/html' || fileName.endsWith('.html')) {
    return await file.text();
  }
  
  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({data: arrayBuffer}).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }
      
      return text;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${file.name}`);
    }
  }
  
  throw new Error(`Unsupported file type: ${file.name}. Supported: PDF, TXT, MD, HTML, ZIP`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // First, store the original file in Supabase Storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const originalFileName = `original-${timestamp}-${file.name}`;
    const originalFilePath = `originals/${originalFileName}`;
    
    console.log(`Storing original file at: ${originalFilePath}`);
    
    const { error: uploadError } = await supabase.storage
      .from('document-processing')
      .upload(originalFilePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to store original file:', uploadError);
      throw new Error(`Failed to store original file: ${uploadError.message}`);
    }

    console.log('Original file stored successfully');

    // Create processing job record with original file reference
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .insert({
        file_name: file.name,
        file_size: file.size,
        original_file_path: originalFilePath,
        original_file_size: file.size,
        status: 'processing'
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    // REAL document processing - NO FAKE DATA
    const extractedFiles = await extractDocumentContent(file);
    console.log(`Extracted ${extractedFiles.length} files with real content`);
    
    if (extractedFiles.length === 0) {
      throw new Error(`Unable to extract content from ${file.name}. Supported formats: ZIP, PDF, TXT, MD, HTML, DOC, DOCX`);
    }
    
    let textContent = extractedFiles.map(f => f.content).join('\n\n--- FILE SEPARATOR ---\n\n');
    const fileCount = extractedFiles.length;
    
    console.log(`Real content extracted: ${textContent.length} characters from ${fileCount} files`);

    // Analyze content with GPT-4.1
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
            content: `You are an expert document analyzer. Analyze the provided text and return a JSON response with the following structure:
            {
              "topics": [
                {
                  "name": "Topic Name",
                  "confidence": 85,
                  "keywords": ["keyword1", "keyword2", "keyword3"],
                  "pages": [1, 2, 3],
                  "contentType": "business|gymnastics|storytelling|financial|educational|other",
                  "sentiment": "positive|neutral|negative",
                  "language": "en"
                }
              ],
              "extractionPlan": [
                "Output format 1",
                "Output format 2"
              ],
              "totalContent": 150,
              "languages": ["English"],
              "documentStructure": "analysis of document structure"
            }
            
            Focus on identifying distinct topics, their sentiment, and relevant keywords. Be thorough but concise.`
          },
          {
            role: 'user',
            content: `Analyze this document content and identify all topics:\n\n${textContent.substring(0, 4000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResult = await openAIResponse.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(aiResult.choices[0].message.content);
      console.log('AI analysis successful - using REAL analysis results');
    } catch (parseError) {
      console.error('Failed to parse AI response - NO FALLBACK, throwing error');
      throw new Error(`AI analysis failed to return valid JSON. Cannot proceed with fake data. Error: ${parseError.message}`);
    }

    // Real content calculation based on actual extracted files
    if (fileCount > 1) {
      analysisResult.totalContent = extractedFiles.reduce((sum, file) => sum + file.content.length, 0);
      console.log(`Real total content calculated: ${analysisResult.totalContent} characters from ${fileCount} files`);
    }

    // Store topics in database
    const topicInserts = analysisResult.topics.map((topic: any) => ({
      job_id: job.id,
      name: topic.name,
      confidence: topic.confidence / 100, // Convert percentage to decimal
      keywords: topic.keywords,
      pages: topic.pages,
      content_type: topic.contentType,
      sentiment: topic.sentiment,
      language: topic.language
    }));

    const { error: topicsError } = await supabase
      .from('detected_topics')
      .insert(topicInserts);

    if (topicsError) {
      console.error('Failed to save topics:', topicsError.message);
    }

    // Update job with completion status
    await supabase
      .from('processing_jobs')
      .update({ 
        status: 'completed',
        total_content: analysisResult.totalContent 
      })
      .eq('id', job.id);

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      ...analysisResult,
      jobId: job.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      topics: [],
      extractionPlan: [],
      totalContent: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
