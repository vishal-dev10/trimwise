

# TrimWise Feature Audit: Keep, Merge, or Remove

## Current Feature Inventory

Here is every user-facing feature in the app, organized by where it lives:

### Flow-Level Features
| # | Feature | Location | Purpose |
|---|---------|----------|---------|
| 1 | Splash Screen | Landing page | Brand intro + CTA |
| 2 | Onboarding Flow | 10-field profile form | Captures budget, city, usage, driving style, family, tech pref, future plans |
| 3 | Car Grid | Main browse screen | Search + browse car models |
| 4 | Variant Comparison | Per-car view | Side-by-side variant cards with scores |
| 5 | Side-by-Side Explainer | Compare mode in Variant Comparison | Pick 2 variants and compare reasoning |
| 6 | Variant Deep Dive | 7-tab detail view | Full analysis of a single variant |
| 7 | Shortlist / Wishlist | Separate page | Heart-saved variants |
| 8 | Chat Advisor | Floating chat bubble | AI-powered Q&A about the variant |

### Deep Dive Tabs (7 tabs — this is where overload happens)
| Tab | Components Inside | What It Shows |
|-----|-------------------|---------------|
| **Overview** | On-road breakdown, Trim Score card, Stress card, EMI card, Key Specs | Basic facts |
| **Features** | Feature list + AIFeatureWorth per feature | Each feature with usefulness, repair risk, resale impact, + AI worth analysis |
| **Intelligence** | AIDecisionExplainer, Trim Score Breakdown, Ownership Stress Index, Feature Regret Analysis | 4 separate analysis sections |
| **Analytics** | FeatureUsageSimulator, VariantDeltaAnalyzer | Projected feature usage + cost-per-feature across trims |
| **TCO** | TCOSimulator, AIOwnershipStory, AINegotiationTips | Total cost, AI ownership narrative, negotiation tips |
| **Financial** | FinancialStretchMeter, UpgradePathSimulator | Affordability gauge + "buy mid now, upgrade later" sim |
| **Resale** | Depreciation timeline + best-time-to-sell tip | Year-by-year resale chart |

---

## Assessment: What's Overwhelming

**The core problem**: The Deep Dive has **7 tabs** with **15+ distinct widgets**. A user who just wants to know "should I buy this variant?" is buried in data. Many features overlap or could be consolidated.

### Redundancies and Overlaps
1. **Trim Score** appears in Overview AND Intelligence — duplicate
2. **Ownership Stress** appears in Overview AND Intelligence — duplicate
3. **TCO tab** and **Financial tab** are conceptually the same thing (money over time)
4. **Resale tab** is just one chart — doesn't warrant its own tab
5. **AIFeatureWorth** (per-feature AI analysis) + **Feature Regret Analysis** + **FeatureUsageSimulator** — three different ways to say "is this feature useful to you"
6. **AIOwnershipStory** and **AINegotiationTips** feel like nice-to-haves that add clutter
7. **VariantDeltaAnalyzer** is useful but buried in an "Analytics" tab most users won't find
8. **FinancialStretchMeter** requires data from onboarding that we don't fully collect (income/savings)

### Features That Are Unique and Valuable
- **Trim Score** — unique composite score, differentiator
- **TCO Simulator** — interactive, practical, high value
- **Variant Delta Analyzer** — "what do I actually get for ₹X more?" — very unique
- **Feature Regret Analysis** — personalized to user profile, unique
- **Depreciation/Resale timeline** — visual and actionable
- **Chat Advisor** — modern, AI-powered, good UX
- **Side-by-Side Explainer** — compare mode is powerful

### Features to Question
- **AIFeatureWorth** — AI analysis per feature is overkill; the regret analysis already covers this
- **AIOwnershipStory** — narrative fluff, doesn't add decision value
- **AINegotiationTips** — nice but feels out of scope for a trim comparison tool
- **FinancialStretchMeter** — requires income data we don't collect properly
- **UpgradePathSimulator** — niche scenario, confusing concept
- **FeatureUsageSimulator** — overlaps with Feature Regret Analysis
- **DepreciationShock** — exists as component but unclear if used

---

## Recommended Restructure

### Consolidate Deep Dive from 7 tabs → 3 tabs

```text
BEFORE (7 tabs):
Overview | Features | Intelligence | Analytics | TCO | Financial | Resale

AFTER (3 tabs):
Overview | Features | Money
```

**Tab 1: Overview** (the "should I buy this?" tab)
- On-road price breakdown
- Key specs
- Trim Score (single card with expandable breakdown)
- AI Decision Explainer (the verdict)
- Ownership Stress (compact)

**Tab 2: Features** (the "what do I get?" tab)
- Feature list with usefulness + repair risk
- Feature Regret Analysis (personalized)
- Variant Delta Analyzer (moved here — "what's the next trim adding?")
- Remove: AIFeatureWorth per feature, FeatureUsageSimulator

**Tab 3: Money** (the "what will it cost me?" tab)
- TCO Simulator (interactive)
- EMI estimate
- Depreciation/Resale timeline (merged in, not separate tab)
- Remove: AIOwnershipStory, AINegotiationTips, FinancialStretchMeter, UpgradePathSimulator

### Components to Remove
1. `AIFeatureWorth.tsx` — redundant with Feature Regret
2. `AIOwnershipStory.tsx` — narrative fluff
3. `AINegotiationTips.tsx` — out of scope
4. `FinancialStretchMeter.tsx` + `FinancialStretchForm.tsx` — incomplete data model
5. `UpgradePathSimulator.tsx` — niche, confusing
6. `FeatureUsageSimulator.tsx` — overlaps with regret analysis
7. `DepreciationShock.tsx` — unused

### Keep and Enhance
- **ChatAdvisor** — keep as floating assistant
- **Side-by-Side Explainer** — keep compare mode
- **Shortlist** — keep
- **Onboarding** — keep but could simplify later

---

## Implementation Summary

| Action | Files |
|--------|-------|
| Restructure `VariantDeepDive.tsx` from 7 tabs to 3 | Major edit |
| Delete 7 component files | `AIFeatureWorth`, `AIOwnershipStory`, `AINegotiationTips`, `FinancialStretchMeter`, `FinancialStretchForm`, `UpgradePathSimulator`, `FeatureUsageSimulator`, `DepreciationShock` |
| Move Variant Delta Analyzer into Features tab | Minor move |
| Merge Resale into Money tab | Consolidation |
| Clean up unused imports in `VariantDeepDive.tsx` | Cleanup |

This reduces the app from **15+ widgets across 7 tabs** to **~8 focused widgets across 3 tabs** — simpler, faster, and every remaining feature is genuinely unique in the market.

