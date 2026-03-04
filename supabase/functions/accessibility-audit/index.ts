import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'Firecrawl not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Scrape the URL with Firecrawl
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['html', 'markdown'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(JSON.stringify({ error: 'Failed to scrape the website. Please check the URL and try again.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = scrapeData.data?.html || scrapeData.html || '';
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const pageTitle = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || formattedUrl;

    console.log('Scrape successful, content length:', html.length + markdown.length);

    // Step 2: Send to AI for accessibility analysis
    const systemPrompt = `You are an expert WCAG 2.1 accessibility auditor and a person who navigates the web using a screen reader daily. You must analyze the provided website HTML and content to produce a comprehensive accessibility audit.

You MUST respond with a valid JSON object using tool calling. Do not include any text outside the tool call.`;

    const userPrompt = `Analyze this website for accessibility issues. URL: ${formattedUrl}
Page title: ${pageTitle}

Here is the HTML content (first 15000 chars):
${html.substring(0, 15000)}

Here is the text content:
${markdown.substring(0, 5000)}

Provide a thorough WCAG 2.1 accessibility audit.`;

    console.log('Sending to AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'submit_audit_results',
              description: 'Submit the complete accessibility audit results',
              parameters: {
                type: 'object',
                properties: {
                  wcagSummary: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Overall accessibility score 0-100' },
                      level: { type: 'string', description: 'e.g. "Does not meet WCAG 2.1 AA" or "Partially meets WCAG 2.1 AA"' },
                      violations: { type: 'number', description: 'Total number of violations found' },
                      categories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'One of: Perceivable, Operable, Understandable, Robust' },
                            score: { type: 'number', description: 'Score 0-100 for this category' },
                          },
                          required: ['name', 'score'],
                        },
                      },
                    },
                    required: ['score', 'level', 'violations', 'categories'],
                  },
                  fixes: {
                    type: 'array',
                    description: 'Top 10 prioritized fixes, ordered by severity and impact',
                    items: {
                      type: 'object',
                      properties: {
                        severity: { type: 'string', enum: ['Critical', 'Serious', 'Moderate', 'Minor'] },
                        title: { type: 'string', description: 'Short descriptive title of the issue' },
                        description: { type: 'string', description: 'Explanation of why this matters for accessibility' },
                      },
                      required: ['severity', 'title', 'description'],
                    },
                  },
                  commentary: {
                    type: 'array',
                    description: '3-5 first-person insights from a blind users perspective navigating this specific website. Be specific to the actual content found.',
                    items: { type: 'string' },
                  },
                },
                required: ['wcagSummary', 'fixes', 'commentary'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'submit_audit_results' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI error:', aiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in AI response:', JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: 'AI did not return structured results' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let auditResults;
    try {
      auditResults = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse AI results:', toolCall.function.arguments);
      return new Response(JSON.stringify({ error: 'Failed to parse AI results' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Audit complete:', auditResults.wcagSummary?.score, 'score,', auditResults.fixes?.length, 'fixes');

    return new Response(JSON.stringify({
      success: true,
      url: formattedUrl,
      pageTitle,
      ...auditResults,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Audit error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
