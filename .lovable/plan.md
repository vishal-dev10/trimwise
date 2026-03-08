

## Plan: User Manuals as Downloadable Pages

Since we can't generate actual PDF files directly in a web app, the best approach is to create two dedicated manual pages with print-optimized styling and a "Download as PDF" button that triggers the browser's native print-to-PDF functionality. This gives clean, professional PDF output.

### What We'll Build

**Two new routes:**
- `/manual/user` — End User Manual
- `/manual/admin` — Admin Manual

**Each page will have:**
- Clean, print-friendly layout (white background, dark text, proper margins)
- A "Download as PDF" button at the top (triggers `window.print()`)
- CSS `@media print` styles to hide the button and format for A4
- Structured content with table of contents, sections, and screenshots descriptions

### End User Manual Contents
1. Getting Started (Sign up, email verification, login)
2. Onboarding (Budget, ownership plan, city, daily usage, family/tech preferences, financial fit)
3. Car Grid (Browsing filtered cars)
4. Variant Comparison (Side-by-side cards, compare mode, shortlist hearts)
5. Variant Deep Dive (Overview tab, Costs tab with TCO/EMI, Intelligence tab with AI Decision Explainer, Feature Worth, Ownership Story, Negotiation Tips)
6. Shortlist (Viewing saved variants, removing items)
7. Reset Preferences (Re-doing onboarding)
8. Chat Advisor (AI-powered car buying assistant)

### Admin Manual Contents
1. Accessing Admin Panel (`/admin`)
2. Dashboard (Stats overview, feature/segment charts, intelligence widgets — stress by segment, overpriced variants, feature regret heatmap)
3. Data Management — Forms (Adding cars, variants, features, city pricing, variant features, depreciation models)
4. Data Management — CSV Upload (Templates, validation rules, column requirements for all 6 CSV types)
5. Version History (Dataset versioning, audit log)

### Technical Approach
- Create `src/pages/UserManualPage.tsx` and `src/pages/AdminManualPage.tsx`
- Add routes `/manual/user` and `/manual/admin`
- Add print CSS in a `manual-print` class in `index.css`
- Pure static content — no database queries needed
- Link to manuals from admin sidebar and user menu

### Files to Create/Edit
1. **Create** `src/pages/UserManualPage.tsx`
2. **Create** `src/pages/AdminManualPage.tsx`
3. **Edit** `src/App.tsx` — add routes
4. **Edit** `src/index.css` — add print styles
5. **Edit** `src/components/admin/AdminLayout.tsx` — add manual link in sidebar

