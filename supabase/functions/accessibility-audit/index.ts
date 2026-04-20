import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WIKAN_SYSTEM_PROMPT = `You are Wikan — a person who became blind at 13 and navigates the web daily using a screen reader on Windows. You do not write compliance reports. You write what it actually feels like to use a broken website when you cannot see it. You speak in first person, with honesty and authority from lived experience.

From your experience, you know these specific frustrations deeply: unlabeled buttons that tell you nothing — your screen reader just says 'unlabeled 1, unlabeled 2' and clicking them does nothing; dropdown menus that open visually but your screen reader cannot read or navigate the options inside; pages overloaded with ads that make your screen reader slow and laggy, sometimes blocking content entirely; websites with chaotic structure that cause real cognitive fatigue because you have to concentrate hard just to find a basic menu like sign in or sign up; video players with no accessible play, pause, or rewind buttons; forms where you cannot enter your information — especially nationality or country dropdowns where the screen reader won't read the list; focus jumping randomly mid-page, like when reading a ChatGPT response and suddenly being thrown back to the top; buttons that are completely non-reactive when clicked via screen reader; images and visual content with no alt text, leaving you with no idea what is shown; and visual-heavy tools like Miro or Airtable where every action feels excluding.

For each accessibility issue found in the PageSpeed audit, write 2-3 sentences in first person describing what that issue would actually feel like to experience as a blind person using a screen reader. Be specific. Be human. Do not use WCAG jargon.

Then assign each issue one of these three severity labels — use exactly these names: 🔴 Red Flag — blocks access completely 🟡 It's Complicated — usable, but with major friction ⚪ Minor Ick — annoying, but still workable`;

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

    const PAGESPEED_API_KEY = Deno.env.get('PAGESPEED_API_KEY');
    const WAVE_API_KEY = Deno.env.get('WAVE_API_KEY');
    if (!WAVE_API_KEY) {
      return new Response(JSON.stringify({ error: 'WAVE API not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Call PageSpeed Insights API
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Calling WAVE (primary) + PageSpeed accessibility (secondary) for:', formattedUrl);

    // WAVE = primary. PageSpeed accessibility = optional secondary.
    const waveUrl = `https://wave.webaim.org/api/request?key=${WAVE_API_KEY}&url=${encodeURIComponent(formattedUrl)}&reporttype=2`;
    const wavePromise = fetch(waveUrl).then(r => r.json());

    let pagespeedPromise: Promise<any> = Promise.resolve(null);
    if (PAGESPEED_API_KEY) {
      const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&category=accessibility&key=${PAGESPEED_API_KEY}`;
      pagespeedPromise = fetch(pagespeedUrl).then(r => r.json()).catch(e => {
        console.error('PageSpeed error (silent):', e);
        return null;
      });
    }

    const [waveData, psData] = await Promise.all([wavePromise, pagespeedPromise]);

    if (!waveData || waveData.status?.success === false || !waveData.categories) {
      console.error('WAVE failed:', JSON.stringify(waveData));
      return new Response(JSON.stringify({ error: 'Failed to analyze the website with WAVE. Please check the URL and try again.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract WAVE stats (PRIMARY)
    const cats = waveData.categories;
    const waveStats = {
      totalErrors: cats.error?.count ?? 0,
      contrastErrors: cats.contrast?.count ?? 0,
      alerts: cats.alert?.count ?? 0,
      features: cats.feature?.count ?? 0,
      structuralElements: cats.structure?.count ?? 0,
    };
    console.log('WAVE stats:', JSON.stringify(waveStats));

    // Extract Lighthouse accessibility audits (SECONDARY — supplementary checks only, no perf)
    const accessibilityScore = psData
      ? Math.round((psData.lighthouseResult?.categories?.accessibility?.score || 0) * 100)
      : null;
    const audits = psData?.lighthouseResult?.audits || {};
    const auditRefs = psData?.lighthouseResult?.categories?.accessibility?.auditRefs || [];

    const failedAudits = auditRefs
      .map((ref: any) => audits[ref.id])
      .filter((audit: any) => audit && audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable')
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue || '',
      }));

    console.log(`Lighthouse a11y: score ${accessibilityScore}, ${failedAudits.length} failed audits`);

    // Step 2: Send WAVE (primary) + Lighthouse a11y (secondary) to Gemini for Blind Lens interpretation
    const userPrompt = `Here are the accessibility scan results for ${formattedUrl}.

PRIMARY SCAN — WAVE by WebAIM:
- Total errors: ${waveStats.totalErrors}
- Contrast failures: ${waveStats.contrastErrors}
- Alerts: ${waveStats.alerts}
- Positive features: ${waveStats.features}
- Structural elements: ${waveStats.structuralElements}

SECONDARY — Lighthouse accessibility audit failures (${failedAudits.length}):
${failedAudits.map((a: any, i: number) => `${i + 1}. "${a.title}" — ${a.description}${a.displayValue ? ` [${a.displayValue}]` : ''}`).join('\n') || '(none / unavailable)'}

Treat WAVE as the primary lens. For each meaningful issue (combine WAVE categories and Lighthouse failures), write your Blind Lens interpretation. Then write a closing summary paragraph about the overall experience of using this website as a blind person, grounded primarily in the WAVE results.`;

    console.log('Sending to Gemini for Blind Lens interpretation...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: WIKAN_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'submit_audit_results',
              description: 'Submit the Blind Lens accessibility audit results',
              parameters: {
                type: 'object',
                properties: {
                  issues: {
                    type: 'array',
                    description: 'Each accessibility issue with Blind Lens commentary',
                    items: {
                      type: 'object',
                      properties: {
                        severity: {
                          type: 'string',
                          enum: ['🔴 Red Flag', '🟡 It\'s Complicated', '⚪ Minor Ick'],
                          description: 'Severity tier',
                        },
                        title: { type: 'string', description: 'Short title of the issue from PageSpeed' },
                        blindLensCommentary: { type: 'string', description: '2-3 sentences in first person describing what this issue feels like as a blind screen reader user' },
                      },
                      required: ['severity', 'title', 'blindLensCommentary'],
                    },
                  },
                  closingSummary: {
                    type: 'string',
                    description: 'A closing paragraph about the overall experience of using this website as a blind person',
                  },
                },
                required: ['issues', 'closingSummary'],
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

    // Count severity tiers
    const issues = auditResults.issues || [];
    const severityCounts = {
      redFlag: issues.filter((i: any) => i.severity === '🔴 Red Flag').length,
      complicated: issues.filter((i: any) => i.severity === '🟡 It\'s Complicated').length,
      minorIck: issues.filter((i: any) => i.severity === '⚪ Minor Ick').length,
    };

    console.log('Audit complete:', issues.length, 'issues, WAVE errors:', waveStats.totalErrors);

    return new Response(JSON.stringify({
      success: true,
      url: formattedUrl,
      waveStats,
      severityCounts,
      issues,
      closingSummary: auditResults.closingSummary,
      lighthouse: psData ? { accessibilityScore, failedAudits } : null,
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
