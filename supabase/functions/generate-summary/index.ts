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
    const { fileName, filePath } = await req.json();
    
    // For now, generate a simple summary
    // In a real implementation, you'd fetch and process the actual document content
    const summary = `# Summary: ${fileName}

## Document Overview
This document has been uploaded to the system for storage and reference.

**File:** ${fileName}  
**Upload Date:** ${new Date().toLocaleDateString()}  
**Storage Location:** Original Documents  

## Quick Summary
This is a placeholder summary. In a full implementation, this would contain:
- Key points from the document
- Main topics covered
- Important highlights
- Action items (if any)

## Access
- **Original Document:** [View Original](${filePath})
- **Generated:** ${new Date().toLocaleString()}

---
*This summary was automatically generated for quick reference.*`;

    return new Response(JSON.stringify({ 
      success: true, 
      summary 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});