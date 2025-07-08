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

      // AI categorization based on file name and type
      const category = categorizeFile(file.name, file.type);
      const tags = generateTags(file.name, file.type);
      const folderPath = generateFolderPath(category, file.name);

      const result = {
        originalName: file.name,
        hash,
        category,
        tags,
        folderPath,
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

function categorizeFile(fileName: string, fileType: string): string {
  const name = fileName.toLowerCase();
  const type = fileType.toLowerCase();

  // Document types
  if (type.includes('pdf') || name.includes('report') || name.includes('document')) {
    return 'Documents';
  }
  
  // Images
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
    return 'Images';
  }
  
  // Spreadsheets
  if (type.includes('sheet') || type.includes('excel') || name.includes('data') || name.includes('spreadsheet')) {
    return 'Spreadsheets';
  }
  
  // Presentations
  if (type.includes('presentation') || type.includes('powerpoint') || name.includes('presentation')) {
    return 'Presentations';
  }
  
  // Archives
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) {
    return 'Archives';
  }
  
  // Audio/Video
  if (type.includes('audio') || type.includes('video') || type.includes('mp3') || type.includes('mp4')) {
    return 'Media';
  }
  
  // Code files
  if (name.includes('.js') || name.includes('.py') || name.includes('.html') || name.includes('code')) {
    return 'Code';
  }
  
  return 'Other';
}

function generateTags(fileName: string, fileType: string): string[] {
  const tags = [];
  const name = fileName.toLowerCase();
  
  // File type tag
  if (fileType.includes('pdf')) tags.push('pdf');
  if (fileType.includes('image')) tags.push('image');
  if (fileType.includes('document')) tags.push('document');
  
  // Content-based tags
  if (name.includes('invoice')) tags.push('invoice', 'financial');
  if (name.includes('contract')) tags.push('contract', 'legal');
  if (name.includes('report')) tags.push('report', 'analysis');
  if (name.includes('presentation')) tags.push('presentation');
  if (name.includes('data')) tags.push('data', 'analytics');
  if (name.includes('photo')) tags.push('photo', 'personal');
  
  // Date-based tags
  const currentYear = new Date().getFullYear();
  if (name.includes(currentYear.toString())) tags.push(currentYear.toString());
  if (name.includes((currentYear - 1).toString())) tags.push((currentYear - 1).toString());
  
  return tags.slice(0, 5); // Limit to 5 tags
}

function generateFolderPath(category: string, fileName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  return `${category}/${year}/${month}`;
}