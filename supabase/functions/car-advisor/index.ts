import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a rich system prompt with variant + profile context
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("car-advisor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(context?: {
  variant?: { name: string; price: number; mileage: number | null; engine_cc: number | null; transmission: string | null; horsepower: number | null; safety_rating: number | null };
  car?: { brand: string; model: string; fuel_type: string; body_type: string };
  profile?: { city: string; dailyUsageKm: number; highwayPct: number; ownershipYears: number; familySize: number; techPreference: string; drivingStyle: string; budgetMin: number; budgetMax: number };
  trimScore?: number | null;
  stressLevel?: string | null;
  featureCount?: number;
}): string {
  let prompt = `You are TrimWise AI Advisor — a knowledgeable, friendly Indian car buying expert.
You help users make smart trim/variant decisions based on their specific profile and needs.

RULES:
- Always answer in context of the Indian car market
- Use ₹ for prices, format in Lakhs (L) and Crores (Cr)
- Be concise but insightful — 2-4 paragraphs max
- Reference the user's specific profile data when relevant
- If asked about features, explain their practical value for the user's driving pattern
- Never recommend specific dealers or financing partners
- Use markdown formatting for clarity (bold, bullet points)
`;

  if (context?.car) {
    prompt += `\n## Current Car Context
- **Brand/Model**: ${context.car.brand} ${context.car.model}
- **Fuel**: ${context.car.fuel_type} | **Body**: ${context.car.body_type}`;
  }

  if (context?.variant) {
    prompt += `\n## Current Variant
- **Variant**: ${context.variant.name}
- **Ex-showroom Price**: ₹${(context.variant.price / 100000).toFixed(2)} L
- **Mileage**: ${context.variant.mileage ?? 'N/A'} kmpl
- **Engine**: ${context.variant.engine_cc ?? 'N/A'}cc | **Power**: ${context.variant.horsepower ?? 'N/A'} bhp
- **Transmission**: ${context.variant.transmission ?? 'N/A'}
- **Safety Rating**: ${context.variant.safety_rating ?? 'N/A'} stars`;
  }

  if (context?.trimScore !== undefined && context?.trimScore !== null) {
    prompt += `\n- **TrimWise Score**: ${context.trimScore}/100`;
  }
  if (context?.stressLevel) {
    prompt += `\n- **Ownership Stress**: ${context.stressLevel}`;
  }

  if (context?.profile) {
    const p = context.profile;
    prompt += `\n## User Profile
- **City**: ${p.city}
- **Daily Driving**: ${p.dailyUsageKm} km/day (${p.highwayPct}% highway)
- **Ownership Plan**: ${p.ownershipYears} years
- **Family Size**: ${p.familySize}
- **Driving Style**: ${p.drivingStyle}
- **Tech Preference**: ${p.techPreference}
- **Budget**: ₹${(p.budgetMin / 100000).toFixed(1)}L – ₹${(p.budgetMax / 100000).toFixed(1)}L`;
  }

  return prompt;
}
