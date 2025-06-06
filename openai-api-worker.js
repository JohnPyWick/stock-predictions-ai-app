import OpenAI from 'openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }
    
    // Only process POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: `${request.method} method not allowed.`}), { status: 405, headers: corsHeaders })
    }
    
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: 'https://gateway.ai.cloudflare.com/v1/5fa9d60df9b68c826e425a3ca741fec3/stock-predictions/openai'
    });
    
    try {
      const messages = await request.json()
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 1.1,
        presence_penalty: 0,
        frequency_penalty: 0
      });
      const response = chatCompletion.choices[0].message;
      
      return new Response(JSON.stringify(response), { headers: corsHeaders });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  },
};