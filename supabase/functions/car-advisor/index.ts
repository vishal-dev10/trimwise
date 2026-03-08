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
    const body = await req.json();
    const { type = "chat", messages, context } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(type, context);
    const isStreaming = type === "chat";

    const aiMessages = type === "chat"
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [{ role: "system", content: systemPrompt }, { role: "user", content: buildUserPrompt(type, context) }];

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
          messages: aiMessages,
          stream: isStreaming,
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

    if (isStreaming) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming: extract content and return
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("car-advisor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Context types ───
interface AdvisorContext {
  variant?: { name: string; price: number; mileage: number | null; engine_cc: number | null; transmission: string | null; horsepower: number | null; safety_rating: number | null };
  car?: { brand: string; model: string; fuel_type: string; body_type: string };
  profile?: { city: string; dailyUsageKm: number; highwayPct: number; ownershipYears: number; familySize: number; techPreference: string; drivingStyle: string; budgetMin: number; budgetMax: number };
  trimScore?: number | null;
  stressLevel?: string | null;
  stressScore?: number | null;
  featureCount?: number;
  // For explain-score
  scoreBreakdown?: { featureUtility: number; resaleStrength: number; reliabilityWeight: number; ownershipCostDeviation: number; overpricedPenalty: number; stressFactor: number };
  featureRegrets?: Array<{ name: string; regretLevel: string; reason: string }>;
  // For compare
  variantA?: { name: string; price: number; trimScore: number; stressLevel: string; mileage: number | null };
  variantB?: { name: string; price: number; trimScore: number; stressLevel: string; mileage: number | null };
  // For feature-worth
  feature?: { name: string; category: string; incrementalCost: number; usefulnessScore: number; repairRisk: string; resaleImpact: string; practicality: number | null };
  // For ownership-story
  tcoData?: { onRoadPrice: number; yearlyFuel: number; yearlyInsurance: number; yearlyMaintenance: number; emi: number };
  depreciationData?: Array<{ year: number; resaleValuePct: number }>;
  // For negotiation
  cityPricing?: { onRoadPrice: number; roadTax: number; registration: number; insurance: number };
}

type AdvisorType = "chat" | "explain-score" | "compare" | "feature-worth" | "negotiation" | "ownership-story";

function buildSystemPrompt(type: AdvisorType, context?: AdvisorContext): string {
  const base = `You are TrimWise AI — a knowledgeable Indian car buying expert.
RULES:
- Indian market context only. Use ₹, format in Lakhs (L) and Crores (Cr).
- Use markdown formatting (bold, bullets) for clarity.
- Be concise and insightful. No filler.
- Never recommend specific dealers or financing partners.
- Reference the user's specific profile data when available.`;

  const profileBlock = context?.profile ? `
## User Profile
- **City**: ${context.profile.city}
- **Daily Driving**: ${context.profile.dailyUsageKm} km/day (${context.profile.highwayPct}% highway)
- **Ownership Plan**: ${context.profile.ownershipYears} years
- **Family Size**: ${context.profile.familySize}
- **Driving Style**: ${context.profile.drivingStyle}
- **Tech Preference**: ${context.profile.techPreference}
- **Budget**: ₹${(context.profile.budgetMin / 100000).toFixed(1)}L – ₹${(context.profile.budgetMax / 100000).toFixed(1)}L` : "";

  const carBlock = context?.car ? `
## Car: ${context.car.brand} ${context.car.model} (${context.car.fuel_type}, ${context.car.body_type})` : "";

  switch (type) {
    case "chat":
      return `${base}
${carBlock}
${context?.variant ? `## Variant: ${context.variant.name} — ₹${((context.variant.price || 0) / 100000).toFixed(2)}L
- Mileage: ${context.variant.mileage ?? 'N/A'} kmpl | Engine: ${context.variant.engine_cc ?? 'N/A'}cc | Power: ${context.variant.horsepower ?? 'N/A'} bhp
- Transmission: ${context.variant.transmission ?? 'N/A'} | Safety: ${context.variant.safety_rating ?? 'N/A'} stars` : ""}
${context?.trimScore != null ? `- **TrimWise Score**: ${context.trimScore}/100` : ""}
${context?.stressLevel ? `- **Ownership Stress**: ${context.stressLevel}` : ""}
${profileBlock}
Keep answers to 2-4 paragraphs max.`;

    case "explain-score":
      return `${base}
${carBlock}
${profileBlock}

You are writing a personalized decision analysis for a specific car variant. Write like an expert automotive journalist giving personal advice — warm, specific, never generic.

Write 3-4 paragraphs covering:
1. How well this variant fits their specific usage pattern and city
2. The value proposition — are they paying for features they'll actually use?
3. Ownership outlook — maintenance complexity, insurance, resale trajectory
4. A clear recommendation with any caveats

Do NOT use bullet points or headers. Write flowing prose. Be specific about numbers. End with a confident recommendation.`;

    case "compare":
      return `${base}
${profileBlock}

You are writing a "TrimWise Take" — a concise comparison verdict between two variants of the same car. Write exactly 2-3 sentences. Be decisive — pick a winner for this user's profile. Reference specific numbers (price difference, features, scores).`;

    case "feature-worth":
      return `${base}
${carBlock}
${profileBlock}

You are explaining whether a specific car feature is worth its premium for this user. Write exactly 2-3 sentences. Be specific with math (cost per month/year of ownership). Reference the user's city, driving pattern, and family size. Give a clear yes/no verdict.`;

    case "negotiation":
      return `${base}
${carBlock}
${profileBlock}

You are giving city-specific, time-aware negotiation tips for buying this car variant. Include:
- Typical discount range for this brand/segment in their city
- Best time of year/quarter to buy
- What accessories or add-ons to negotiate
- Insurance negotiation tips
Keep it to 3-4 concise bullet points. Be specific to the brand and city.`;

    case "ownership-story":
      return `${base}
${carBlock}
${profileBlock}

You are writing a year-by-year ownership narrative. Write a brief, engaging story of what owning this car will look like financially. Cover each year of the ownership plan. Include EMI payments, fuel costs, maintenance milestones, and resale value at each stage. Use ₹ amounts. Keep each year to 1-2 sentences. End with a total cost summary.`;

    default:
      return base;
  }
}

function buildUserPrompt(type: AdvisorType, context?: AdvisorContext): string {
  switch (type) {
    case "explain-score": {
      const v = context?.variant;
      const b = context?.scoreBreakdown;
      const regrets = context?.featureRegrets ?? [];
      return `Analyze this variant for me:
**${v?.name ?? 'Unknown'}** at ₹${((v?.price || 0) / 100000).toFixed(2)}L
- TrimWise Score: ${context?.trimScore ?? 'N/A'}/100
- Ownership Stress: ${context?.stressLevel ?? 'N/A'} (${context?.stressScore ?? 'N/A'}/100)
- Mileage: ${v?.mileage ?? 'N/A'} kmpl
${b ? `- Score Breakdown: Feature Utility ${b.featureUtility}, Resale Strength ${b.resaleStrength}, Reliability ${b.reliabilityWeight}, Cost Deviation ${b.ownershipCostDeviation}, Overpriced Penalty ${b.overpricedPenalty}, Stress Factor ${b.stressFactor}` : ''}
${regrets.length > 0 ? `- Feature Gaps: ${regrets.map(r => `${r.name} (${r.regretLevel})`).join(', ')}` : '- No significant feature gaps'}`;
    }

    case "compare": {
      const a = context?.variantA;
      const b = context?.variantB;
      return `Compare these two variants for my profile:
**${a?.name}** — ₹${((a?.price || 0) / 100000).toFixed(2)}L, Score: ${a?.trimScore}/100, Stress: ${a?.stressLevel}, ${a?.mileage ?? 'N/A'} kmpl
vs
**${b?.name}** — ₹${((b?.price || 0) / 100000).toFixed(2)}L, Score: ${b?.trimScore}/100, Stress: ${b?.stressLevel}, ${b?.mileage ?? 'N/A'} kmpl
Price difference: ₹${(Math.abs((a?.price || 0) - (b?.price || 0)) / 100000).toFixed(2)}L`;
    }

    case "feature-worth": {
      const f = context?.feature;
      return `Is **${f?.name}** worth it for me?
- Category: ${f?.category}
- Premium: ₹${((f?.incrementalCost || 0) / 1000).toFixed(0)}K
- Usefulness: ${f?.usefulnessScore}/10
- Repair Risk: ${f?.repairRisk}
- Resale Impact: ${f?.resaleImpact}
- Practicality: ${f?.practicality ?? 'N/A'}/10`;
    }

    case "negotiation": {
      const v = context?.variant;
      const cp = context?.cityPricing;
      return `Give me negotiation tips for buying:
**${context?.car?.brand} ${context?.car?.model} — ${v?.name}**
- Ex-showroom: ₹${((v?.price || 0) / 100000).toFixed(2)}L
- On-road in ${context?.profile?.city}: ₹${((cp?.onRoadPrice || 0) / 100000).toFixed(2)}L
- Road Tax: ₹${((cp?.roadTax || 0) / 1000).toFixed(0)}K, Registration: ₹${((cp?.registration || 0) / 1000).toFixed(0)}K, Insurance: ₹${((cp?.insurance || 0) / 1000).toFixed(0)}K`;
    }

    case "ownership-story": {
      const v = context?.variant;
      const tco = context?.tcoData;
      const dep = context?.depreciationData ?? [];
      return `Write my ownership story for:
**${context?.car?.brand} ${context?.car?.model} — ${v?.name}**
- On-road: ₹${((tco?.onRoadPrice || 0) / 100000).toFixed(2)}L
- EMI: ₹${(tco?.emi || 0).toLocaleString()}/month
- Annual fuel: ₹${((tco?.yearlyFuel || 0) / 1000).toFixed(0)}K
- Annual insurance: ₹${((tco?.yearlyInsurance || 0) / 1000).toFixed(0)}K
- Annual maintenance: ₹${((tco?.yearlyMaintenance || 0) / 1000).toFixed(0)}K
- Depreciation: ${dep.map(d => `Yr${d.year}: ${d.resaleValuePct}%`).join(', ')}
- Ownership plan: ${context?.profile?.ownershipYears ?? 5} years`;
    }

    default:
      return "";
  }
}
