import {
  ROLES, EXPOSURE_ROLES, GATEWAY_TIERS, GOVERNANCE_TIERS,
  PROTOCOL_NOTES, SCORE_FACTORS,
} from '../data/framework.js'

const num = (v) => Number(v) || 0

export function assess(answers) {
  const scores = {}
  for (const f of SCORE_FACTORS) scores[f.key] = num(answers[f.key])
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)

  // --- Governance tier from score bands (Tab 5) ---
  const baseGovernanceKey = totalScore <= 10 ? 'light' : totalScore <= 16 ? 'managed' : 'full'
  let governanceKey = baseGovernanceKey
  const governanceAdjustments = []

  // --- Gateway tier from the decision tree (Tab 4) ---
  // Step 1: any consumer outside the trust boundary → Enterprise.
  // Step 2: multiple internal teams/domains → Platform. Step 3: single team → App.
  let gatewayKey
  let gatewayReason
  if (scores.exposure >= 3) {
    gatewayKey = 'enterprise'
    gatewayReason = 'A consumer sits OUTSIDE the enterprise trust boundary (partner or public) — decision tree step 1 makes the Enterprise (edge) gateway mandatory.'
  } else if (scores.exposure === 2 || scores.consumerCount >= 2) {
    gatewayKey = 'platform'
    gatewayReason = 'Consumed across multiple internal teams or domains — decision tree step 2 places it behind the Platform gateway for cross-team discoverability and token translation.'
  } else {
    gatewayKey = 'app'
    gatewayReason = "Consumed only within one team/product — decision tree step 3 keeps it at the App/micro-gateway. Don't burden a single-consumer API with enterprise policy."
  }

  // --- Escalation factors (Tab 4) ---
  const escalations = []
  const order = ['app', 'platform', 'enterprise']
  const raiseGateway = (min, reason) => {
    if (order.indexOf(gatewayKey) < order.indexOf(min)) {
      gatewayKey = min
      escalations.push(reason)
    }
  }

  if (scores.dataSensitivity === 4 && scores.exposure >= 2) {
    raiseGateway('enterprise', 'Regulated data (PII/PHI/PCI) crossing a boundary — often forces an edge-registered gateway even for partner-only traffic.')
  }
  if (scores.commercialModel >= 3) {
    raiseGateway('enterprise', 'Monetization / metering required — only the edge APIM has plans and billing capability.')
  }
  if (scores.blastRadius >= 3) {
    raiseGateway('platform', 'High blast radius (many downstream consumers, breaking-change risk) — escalate at least to Platform tier.')
  }

  // --- Anti-pattern detection (Tab 7) ---
  // Regulated-data check runs first, against the BASE score band: anti-pattern 3
  // escalates to Tier 1 + Enterprise gateway regardless of any other adjustment.
  const antiPatterns = []
  if (scores.dataSensitivity === 4 && baseGovernanceKey === 'light') {
    governanceKey = 'full'
    governanceAdjustments.push('Raised to Tier 1 (Full): regulated data must never flow through a Tier 3 (Light) governed API — escalate regardless of consumer count.')
    raiseGateway('enterprise', 'Regulated data on a lightly-scored API — route through the Enterprise gateway regardless of consumer count (anti-pattern 3 fix).')
    antiPatterns.push({
      title: 'Regulated data through a lightly-governed API',
      detail: 'The rubric score alone landed this API in Tier 3 (Light), but it carries regulated (PII/PHI/PCI) data.',
      fix: 'Escalate to Tier 1 governance and route through the Enterprise gateway regardless of consumer count.',
    })
  } else if (scores.dataSensitivity === 4 && governanceKey === 'managed') {
    governanceAdjustments.push('Note: regulated data means security & privacy review and a legal/compliance gate should be added on top of the standard Tier 2 controls.')
  }
  if (answers.directExternal === 'yes') {
    antiPatterns.push({
      title: 'Internal-layer API directly addressable externally',
      detail: 'A System or Domain API is directly reachable by a partner or the public internet.',
      fix: 'Front it with a purpose-built façade at the Enterprise gateway; keep the internal API private.',
    })
  }
  if (answers.role === 'bff' && answers.bffShared === 'yes') {
    antiPatterns.push({
      title: 'Shared BFF — a shared BFF is not a BFF',
      detail: 'This BFF is consumed by more than one channel/experience team.',
      fix: 'Split into channel-specific BFFs, or formally promote and re-classify it as a Domain/Process API with Tier 2 governance.',
    })
    if (governanceKey === 'light') {
      governanceKey = 'managed'
      governanceAdjustments.push('Raised from Tier 3 (Light) to Tier 2 (Managed): a shared BFF must be promoted to a governed Domain/Process API.')
    }
  }
  if (scores.commercialModel >= 3 && gatewayKey !== 'enterprise') {
    // Defensive: escalation above should prevent this, but flag it if it ever surfaces.
    antiPatterns.push({
      title: 'Monetized API below Enterprise tier',
      detail: 'A monetized/metered API is registered below the Enterprise gateway.',
      fix: 'Move to Enterprise tier — only the edge APIM supports plans, quotas, and billing.',
    })
  }

  // --- Effective classification (Tab 2 / Tab 6) ---
  const role = ROLES[answers.role]
  let exposureRole = null
  if (scores.exposure === 3) exposureRole = EXPOSURE_ROLES.partner
  if (scores.exposure === 4) exposureRole = EXPOSURE_ROLES.public

  // --- Recommendations ---
  const recommendations = buildRecommendations({ answers, scores, governanceKey, gatewayKey, role, exposureRole, antiPatterns })

  // Compare against the consolidated-mapping defaults (Tab 6)
  const defaults = exposureRole
    ? { gateway: exposureRole.usualGateway, governance: exposureRole.usualGovernance, note: exposureRole.mappingNote }
    : role
      ? { gateway: role.usualGateway, governance: role.usualGovernance, note: role.mappingNote }
      : null

  return {
    scores,
    totalScore,
    governance: GOVERNANCE_TIERS[governanceKey],
    governanceKey,
    governanceAdjustments,
    gateway: GATEWAY_TIERS[gatewayKey],
    gatewayKey,
    gatewayReason,
    escalations,
    antiPatterns,
    role,
    exposureRole,
    defaults,
    protocolNote: PROTOCOL_NOTES[answers.protocol],
    recommendations,
  }
}

function buildRecommendations({ answers, scores, governanceKey, gatewayKey, role, exposureRole, antiPatterns }) {
  const recs = []

  // Gateway registration
  const gw = GATEWAY_TIERS[gatewayKey]
  recs.push({
    category: 'Gateway & Registration',
    items: [
      `Register the API behind the ${gw.label} (${gw.aka}).`,
      `Ensure the gateway at this tier provides: ${gw.capabilities.join(', ')}.`,
      ...(gatewayKey === 'enterprise'
        ? ['External traffic should traverse Enterprise → Platform → App gateways in sequence; "placement" means the highest tier at which the API is registered and governed.']
        : []),
    ],
  })

  // Governance controls
  const gov = GOVERNANCE_TIERS[governanceKey]
  recs.push({
    category: 'Governance Controls',
    items: gov.controls.map((c) => c + '.'),
  })

  // Role-specific focus
  if (role) {
    const items = [`Governance focus for a ${role.label}: ${role.governanceFocus}.`]
    if (answers.role === 'system') items.push('Keep it behind its owning domain — System/Foundation APIs are almost never exposed beyond it. Apply strict change control: it wraps a system of record.')
    if (answers.role === 'domain') items.push('Treat it as a product: contract stability, semantic versioning, and backward compatibility are the core disciplines. Front it with a façade before any external exposure.')
    if (answers.role === 'process') items.push('Review idempotency and compensation logic explicitly, and watch for cross-domain coupling leaking through the orchestration contract.')
    if (answers.role === 'bff') items.push('Keep exactly one BFF per experience, owned by that experience team. If a second channel wants it, split or promote it.')
    if (answers.role === 'utility') items.push('High reuse means Domain-grade reliability expectations: publish SLOs and manage deprecations like a Domain API.')
    recs.push({ category: 'Role-Specific Guidance', items })
  }

  // Exposure/façade guidance
  if (exposureRole) {
    recs.push({
      category: 'External Exposure',
      items: [
        `${exposureRole.label}: ${exposureRole.definition}`,
        `Edge concerns to put in place: ${exposureRole.governanceFocus}.`,
        'Never expose the internal-layer API directly — the façade preserves freedom to refactor internals without breaking external contracts.',
      ],
    })
  }

  // Data authority
  if (answers.dataAuthority === 'sor') {
    recs.push({
      category: 'Data Governance',
      items: ['This API fronts a System of Record — apply stricter change control than derived/aggregated views, with schema stewardship and coordinated migration for breaking changes.'],
    })
  } else if (answers.dataAuthority === 'reference') {
    recs.push({
      category: 'Data Governance',
      items: ['System of Reference / read-model — document freshness and consistency guarantees in the contract so consumers know how stale data can be.'],
    })
  }

  // Protocol capabilities
  recs.push({
    category: 'Protocol Capabilities',
    items: [PROTOCOL_NOTES[answers.protocol], 'Remember: protocol dictates gateway capability, not tier — do not let protocol change the placement or governance decision.'],
  })

  // Sensitivity
  if (scores.dataSensitivity === 4) {
    recs.push({
      category: 'Security & Compliance',
      items: [
        'Regulated data (PII/PHI/PCI): mandatory security & privacy review and a legal/compliance gate before go-live.',
        'Confirm data-residency and audit-logging requirements with compliance; regulated data can force edge registration even for partner-only traffic.',
      ],
    })
  } else if (scores.dataSensitivity === 3) {
    recs.push({
      category: 'Security & Compliance',
      items: ['Confidential data: enforce the security baseline (authn/authz on every route, TLS everywhere) and restrict discovery/catalog visibility to authorized audiences.'],
    })
  }

  // Anti-pattern fixes first-class
  if (antiPatterns.length) {
    recs.push({
      category: 'Remediation (Anti-Patterns Found)',
      items: antiPatterns.map((ap) => `${ap.title} — ${ap.fix}`),
    })
  }

  return recs
}
