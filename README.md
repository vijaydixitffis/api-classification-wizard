# API Classification & Governance Wizard

A React single-page app that walks you through classifying an API against the
**API Classification & Governance Framework** (7 classification axes, 6-factor
governance scoring rubric, 3 gateway tiers), then produces a full assessment
report with recommendations.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle in dist/
```

## What it does

The wizard asks 10–12 questions (two are conditional anti-pattern checks) and
shows framework guidance alongside every question:

1. API name & description
2. Protocol / interaction style (axis 1)
3. Functional / architectural role (axis 2)
4. *Conditional:* shared-BFF check (only when role = BFF)
5. Data authority (axis 4)
6. Exposure / trust boundary (axis 3) — rubric factor 1
7. *Conditional:* direct-external-addressability check (only for System/Domain APIs with external exposure)
8. Consumer topology (axis 6) — rubric factor 2
9. Data sensitivity (axis 5) — rubric factor 3
10. Breaking-change blast radius — rubric factor 4
11. Contractual SLA — rubric factor 5
12. Commercial model (axis 7) — rubric factor 6

### The engine ([src/logic/engine.js](src/logic/engine.js))

- **Governance score** = sum of the six rubric factors (6–24).
  Bands: 6–10 → Tier 3 Light · 11–16 → Tier 2 Managed · 17–24 → Tier 1 Full.
- **Gateway tier** via the decision tree: external consumer → Enterprise;
  multiple internal teams → Platform; single team → App.
- **Escalation factors**: regulated data crossing a boundary → Enterprise;
  monetization/metering → Enterprise (only edge APIM has plans/billing);
  high blast radius → at least Platform.
- **Anti-pattern detection**: internal API directly addressable externally,
  shared BFF, regulated data through a Light-tier API, monetized API below
  Enterprise tier — each with the framework's recommended fix, and with the
  governance/gateway escalations the framework mandates.

The results page shows the verdict cards, per-factor score breakdown,
7-axis classification profile, gateway reasoning, detected anti-patterns,
categorized recommendations, the consolidated-mapping defaults for
comparison, and the five design principles. A Print/PDF button produces a
print-friendly report.

All framework knowledge lives in [src/data/framework.js](src/data/framework.js),
extracted from `API_Classification_Governance_Framework.xlsx`.
