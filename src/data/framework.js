// Knowledge base extracted from "API Classification & Governance Framework" workbook.
// Every guidance string traces back to a tab in the source spreadsheet.

export const ROLES = {
  system: {
    label: 'System / Foundation API',
    definition: 'Thin, stable wrapper over a system of record (mainframe, ERP, core DB, SaaS).',
    reuse: 'Low — rarely reused broadly, rarely exposed beyond its owning domain',
    ownsData: 'Yes (System of Record)',
    governanceFocus: 'Data ownership & stability of the underlying system',
    example: 'SAP Order-Create wrapper API',
    usualGateway: 'App or Platform',
    usualGovernance: 'Tier 2 (Managed) — data-ownership focus',
    mappingNote: 'Almost never exposed beyond owning domain',
  },
  domain: {
    label: 'Domain API',
    definition: 'Exposes a business capability aligned to a bounded context. The canonical, reusable enterprise asset.',
    reuse: "High — the 'product' in an API-as-product model",
    ownsData: 'Yes / Yes-of-reference',
    governanceFocus: 'Contract stability, versioning, backward compatibility',
    example: 'Customer API, Payments API, Inventory API',
    usualGateway: 'Platform',
    usualGovernance: 'Tier 2 (Managed)',
    mappingNote: "The reusable 'product'; front it before any external exposure",
  },
  process: {
    label: 'Process / Orchestrator API',
    definition: 'Coordinates multiple domains: sagas, long-running workflows, transactional composition.',
    reuse: 'Medium — reused by multiple process consumers',
    ownsData: 'No — owns coordination, not data',
    governanceFocus: 'Idempotency, compensation logic, avoiding cross-domain coupling leakage',
    example: 'Order Fulfillment Orchestrator',
    usualGateway: 'Platform',
    usualGovernance: 'Tier 2 (Managed)',
    mappingNote: 'Govern idempotency, compensation, coupling',
  },
  bff: {
    label: 'Experience / Facade API (BFF)',
    definition: 'Channel- or use-case-specific shaping & aggregation for ONE known consumer (mobile app, SPA, a specific partner journey).',
    reuse: "Low by design — one BFF per experience, owned by that experience's team",
    ownsData: 'No',
    governanceFocus: 'Least strict; the anti-pattern is BFF reuse across channels (re-classify as Domain/Process if that happens)',
    example: 'Mobile-App-Home-Screen BFF',
    usualGateway: 'App',
    usualGovernance: 'Tier 3 (Light)',
    mappingNote: 'One per consumer; a shared BFF is an anti-pattern → re-classify',
  },
  utility: {
    label: 'Utility / Shared API',
    definition: 'Cross-cutting capability: notification, document generation, auth, audit, feature flags.',
    reuse: 'High',
    ownsData: 'No',
    governanceFocus: 'Reliability & reuse governance similar to Domain APIs',
    example: 'Notification Service API',
    usualGateway: 'Platform',
    usualGovernance: 'Tier 2 (Managed)',
    mappingNote: 'High reuse → treat like Domain',
  },
}

// Partner / Public are EXPOSURE, not roles (Tab 2) — used in results when exposure is external.
export const EXPOSURE_ROLES = {
  partner: {
    label: 'Partner API (exposure, not a role)',
    definition: 'A Facade or Process API deliberately exposed to a named external business partner via contract.',
    governanceFocus: 'Contractual SLA, partner onboarding, quota plans, security review',
    usualGateway: 'Enterprise (edge)',
    usualGovernance: 'Tier 1 (Full)',
    mappingNote: 'Contract, quota plans, partner onboarding',
  },
  public: {
    label: 'Public / External Customer API (exposure, not a role)',
    definition: 'A Facade API exposed to unbounded or self-service external developers/customers.',
    governanceFocus: 'Full design authority review, legal/compliance, developer portal, monetization',
    usualGateway: 'Enterprise (edge)',
    usualGovernance: 'Tier 1 (Full)',
    mappingNote: 'WAF, developer portal, SLA, often monetized',
  },
}

export const PROTOCOL_NOTES = {
  rest: 'REST is the baseline style; all gateway tiers support it natively. Focus review on resource modelling and versioning strategy.',
  graphql: 'GraphQL needs query-depth limiting and field-level authorization at the gateway. Choose a gateway product at your tier that supports GraphQL policies.',
  soap: 'SOAP often needs a REST façade at the edge. Verify the gateway can mediate SOAP or plan a façade layer.',
  grpc: 'gRPC needs HTTP/2-aware routing. Verify the gateway at your tier supports HTTP/2 and gRPC pass-through or transcoding.',
  async: 'Async/Event (webhooks, Kafka, AMQP) requires AsyncAPI specification instead of OpenAPI, and event-gateway or webhook-management capability at your tier.',
  websocket: 'WebSocket/Streaming needs long-lived connection support and connection-level rate limiting at the gateway.',
}

export const GATEWAY_TIERS = {
  app: {
    label: 'App-Level Gateway',
    aka: 'Micro-gateway, sidecar, in-cluster ingress',
    sitsAt: 'Inside the product/app boundary',
    scope: 'One team / one product',
    capabilities: ['Local routing', 'Service auth (mTLS)', 'Basic rate limiting', 'Per-service policy'],
  },
  platform: {
    label: 'Platform-Level Gateway',
    aka: 'Domain / LOB / business-unit gateway',
    sitsAt: 'Between teams, still internal',
    scope: 'A domain or line of business',
    capabilities: ['Internal discovery', 'Token translation', 'Cross-team rate limiting', 'Internal SLO enforcement', 'East-west traffic management'],
  },
  enterprise: {
    label: 'Enterprise-Level Gateway',
    aka: 'Edge / north-south gateway, full API Management (APIM)',
    sitsAt: 'At the enterprise perimeter',
    scope: 'Whole organization + external world',
    capabilities: ['WAF', 'DDoS/bot protection', 'Developer portal', 'Partner onboarding', 'Monetization/metering', 'External SLA enforcement', 'Quota/plan management'],
  },
}

export const GOVERNANCE_TIERS = {
  light: {
    label: 'Tier 3: Light / Self-Service',
    band: '6 – 10',
    controls: [
      'Naming + security baseline conformance',
      'Catalog registration',
      'Team-owned versioning',
    ],
    typicalRoles: 'Experience/BFF, App-internal utility APIs',
  },
  managed: {
    label: 'Tier 2: Managed',
    band: '11 – 16',
    controls: [
      'Design review vs. standards',
      'Mandatory OpenAPI/AsyncAPI spec',
      'Deprecation policy with notice windows',
      'SLO + observability',
      'Backward-compatibility rules',
    ],
    typicalRoles: 'Domain, Process/Orchestrator, Shared/Utility APIs',
  },
  full: {
    label: 'Tier 1: Full / Controlled',
    band: '17 – 24',
    controls: [
      'Formal design authority sign-off',
      'Security & privacy review',
      'Contract testing',
      'Formal SLA',
      'Staged deprecation with partner comms',
      'Change advisory',
      'Legal/compliance gate',
    ],
    typicalRoles: 'Partner APIs, Public/External Customer APIs',
  },
}

// The 7 classification axes (Tab 1) — summarized for the landing page.
export const AXES = [
  { name: 'Protocol / Interaction Style', values: 'REST, GraphQL, SOAP, gRPC, Async/Event, WebSocket', drives: 'Gateway CAPABILITIES needed (not tier)' },
  { name: 'Functional / Architectural Role', values: 'System, Domain, Process, Experience/BFF, Utility', drives: 'Ownership model, reuse expectations, layering' },
  { name: 'Exposure / Trust Boundary', values: 'Private-to-app, Shared-internal, Partner, Public', drives: 'GATEWAY TIER (dominant driver)' },
  { name: 'Data Authority', values: 'System of Record, System of Reference, Derived', drives: 'Governance around data ownership & consistency' },
  { name: 'Data Sensitivity / Regulatory', values: 'Public, Internal, Confidential, Regulated (PII/PHI/PCI)', drives: 'GOVERNANCE INTENSITY, security baseline' },
  { name: 'Consumer Topology', values: 'Single consumer, Few teams, Many internal, Unbounded external', drives: 'Governance intensity, blast radius' },
  { name: 'Commercial Model', values: 'None, Chargeback, Partner-contracted, Monetized', drives: 'Governance + edge features (metering, billing)' },
]

export const PRINCIPLES = [
  { title: 'Layering aligns with exposure', why: 'Deeper layers (System/Domain) sit behind; edge-facing façades (Experience/Partner) sit at the enterprise gateway. Traffic flows edge → platform → app.' },
  { title: 'Never expose an internal-layer API directly externally', why: 'Put a purpose-built façade at the edge. Preserves freedom to refactor internals without breaking external contracts; lets you apply edge-only concerns (metering, WAF, quota plans) in one place.' },
  { title: 'A shared BFF is not a BFF', why: 'If two channels depend on it, split it or promote it to a governed Domain/Process API and re-score its governance tier upward.' },
  { title: 'Governance follows the operating model, not just the API', why: 'Gateway tier tells you WHERE policy is enforced; the operating model tells you WHO sets it. Use federated governance: central authority owns standards, teams execute autonomously.' },
  { title: 'Protocol dictates gateway capability, not tier', why: "Choose gateway products per tier that support the protocols present at that tier (GraphQL, gRPC, SOAP, async) — but don't let protocol change the placement decision." },
]

// Wizard question definitions. `scoreKey` marks the six rubric factors (Tab 5).
export const QUESTIONS = [
  {
    id: 'apiName',
    type: 'text',
    title: 'What is the API called?',
    subtitle: 'Give the API a name and a one-line description so the assessment report reads well.',
    placeholder: 'e.g. Customer Profile API',
    guidance: {
      heading: 'Key principle from the framework',
      body: "There is no single 'type' of API. Every API sits at a point across multiple independent axes — protocol, functional role, exposure, data authority, sensitivity, consumer topology, commercial model. This wizard walks you through all of them. Gateway tier is driven mainly by the EXPOSURE axis; governance intensity is driven by a weighted combination of all axes.",
      points: [],
    },
  },
  {
    id: 'protocol',
    type: 'choice',
    title: 'What protocol / interaction style does the API use?',
    subtitle: 'Axis 1 of 7 — drives the gateway CAPABILITIES needed, not the tier.',
    options: [
      { value: 'rest', label: 'REST', hint: 'Resource-oriented HTTP/JSON — the enterprise baseline.' },
      { value: 'graphql', label: 'GraphQL', hint: 'Client-shaped queries; needs query-depth & field-level authz.' },
      { value: 'soap', label: 'SOAP', hint: 'XML web services; often fronted by a REST façade at the edge.' },
      { value: 'grpc', label: 'gRPC', hint: 'Binary HTTP/2 RPC; needs HTTP/2-aware routing.' },
      { value: 'async', label: 'Async / Event', hint: 'Webhooks, Kafka, AMQP — document with AsyncAPI.' },
      { value: 'websocket', label: 'WebSocket / Streaming', hint: 'Long-lived bidirectional connections.' },
    ],
    guidance: {
      heading: 'Protocol dictates gateway capability, not tier',
      body: 'A common review mistake is assigning governance tier from protocol (e.g. "all GraphQL APIs are Tier 1"). The framework flags that as an anti-pattern — protocol only tells you what the gateway product must support.',
      points: [
        'GraphQL needs query-depth limits and field-level authorization.',
        'gRPC needs HTTP/2-aware routing.',
        'SOAP often needs a REST façade at the edge.',
        'Async/Event APIs are specified with AsyncAPI rather than OpenAPI.',
      ],
    },
  },
  {
    id: 'role',
    type: 'choice',
    title: 'What functional / architectural role does the API play?',
    subtitle: 'Axis 2 of 7 — drives ownership model, reuse expectations, and layering.',
    options: [
      { value: 'system', label: 'System / Foundation', hint: 'Thin wrapper over a system of record (ERP, mainframe, core DB, SaaS).' },
      { value: 'domain', label: 'Domain', hint: 'A business capability in a bounded context — the reusable enterprise asset.' },
      { value: 'process', label: 'Process / Orchestrator', hint: 'Coordinates multiple domains: sagas, workflows, composition.' },
      { value: 'bff', label: 'Experience / Facade (BFF)', hint: 'Channel-specific shaping for ONE known consumer.' },
      { value: 'utility', label: 'Utility / Shared', hint: 'Cross-cutting capability: notifications, documents, auth, audit, flags.' },
    ],
    guidance: {
      heading: 'Role is what the API does — not who consumes it',
      body: "Exposure (who consumes it) is a SEPARATE axis you'll answer next. A 'Partner API' or 'Public API' is usually a Facade or Process API deliberately placed at the edge — not a distinct role. Pick the role by function.",
      points: [
        'System / Foundation — owns system-of-record data; governance focuses on data ownership and stability. Example: SAP Order-Create wrapper.',
        'Domain — the canonical reusable product; governance focuses on contract stability, versioning, backward compatibility. Example: Customer API, Payments API.',
        'Process / Orchestrator — owns coordination, not data; govern idempotency and compensation logic. Example: Order Fulfillment Orchestrator.',
        'Experience / BFF — one per experience, owned by that experience team; least strict governance. Example: Mobile-App-Home-Screen BFF.',
        'Utility / Shared — high reuse; govern like a Domain API. Example: Notification Service API.',
      ],
    },
  },
  {
    id: 'bffShared',
    type: 'choice',
    condition: (a) => a.role === 'bff',
    title: 'Is this BFF consumed by more than one channel or experience team?',
    subtitle: 'Anti-pattern check — a shared BFF is not a BFF.',
    options: [
      { value: 'no', label: 'No — exactly one channel', hint: 'One experience, one owning team. A true BFF.' },
      { value: 'yes', label: 'Yes — multiple channels depend on it', hint: 'Two or more channels/experience teams consume it today.' },
    ],
    guidance: {
      heading: 'A shared BFF is not a BFF',
      body: 'If two channels depend on it, the framework says: split it into channel-specific BFFs, or formally promote it to a governed Domain/Process API and re-score its governance tier upward. Single-consumer BFFs may stay lightly governed even if functionally complex.',
      points: [
        'Recommended fix: split into channel-specific BFFs, or re-classify as Domain/Process with Tier 2 governance.',
        'If you answer Yes, the wizard will flag the anti-pattern and raise the recommended governance accordingly.',
      ],
    },
  },
  {
    id: 'dataAuthority',
    type: 'choice',
    title: 'What is the data authority of this API?',
    subtitle: 'Axis 4 of 7 — drives governance around data ownership & consistency.',
    options: [
      { value: 'sor', label: 'System of Record', hint: 'The authoritative master source of this data.' },
      { value: 'reference', label: 'System of Reference / read-model', hint: 'A synchronized copy or read-optimized projection.' },
      { value: 'derived', label: 'Derived / aggregated', hint: 'Computed, combined, or analytical views over other sources.' },
    ],
    guidance: {
      heading: 'Why data authority matters',
      body: 'System-of-record APIs need stricter change control than derived or aggregated views — a breaking change at the source ripples through every downstream copy and projection.',
      points: [
        'System of Record → strictest change control and schema stewardship.',
        'System of Reference → governance focuses on freshness/consistency contracts.',
        'Derived/aggregated → lightest data governance; changes are contained.',
      ],
    },
  },
  {
    id: 'exposure',
    type: 'choice',
    scoreKey: 'exposure',
    title: 'Who sits across the trust boundary — what is the exposure?',
    subtitle: 'Axis 3 of 7 — the DOMINANT driver of gateway tier. Rubric factor 1 of 6.',
    options: [
      { value: 1, label: 'Private-to-app', hint: 'Consumed only inside one product/app boundary. (Score 1)' },
      { value: 2, label: 'Shared-internal (platform)', hint: 'Consumed across teams/domains, still inside the enterprise. (Score 2)' },
      { value: 3, label: 'Partner (B2B)', hint: 'Named external business partners under contract. (Score 3)' },
      { value: 4, label: 'Public / External', hint: 'Unbounded or self-service external developers/customers. (Score 4)' },
    ],
    guidance: {
      heading: 'The single strongest signal',
      body: 'Exposure is the single strongest signal for where an API must be registered. The gateway decision tree starts here: any consumer OUTSIDE the enterprise trust boundary (partner or public) makes the Enterprise (edge) gateway mandatory.',
      points: [
        'Partner or Public → Enterprise gateway, fronted by a purpose-built façade, with WAF, quota plans, developer portal, formal SLA.',
        'Shared-internal across multiple teams → Platform gateway (cross-team discoverability, token translation).',
        "Private-to-app → App/micro-gateway; don't burden a single-consumer API with enterprise policy.",
        'Never expose an internal-layer API (System/Domain) directly externally — always front it with a façade at the edge.',
      ],
    },
  },
  {
    id: 'directExternal',
    type: 'choice',
    condition: (a) => Number(a.exposure) >= 3 && (a.role === 'system' || a.role === 'domain'),
    title: 'Is this internal-layer API directly addressable by the partner/public consumer?',
    subtitle: 'Anti-pattern check — internal layers must not be reachable from outside.',
    options: [
      { value: 'no', label: 'No — a purpose-built façade fronts it', hint: 'External consumers only ever see the façade at the edge.' },
      { value: 'yes', label: 'Yes — externals hit it directly', hint: 'The System/Domain API itself is reachable from outside.' },
    ],
    guidance: {
      heading: 'Never expose an internal-layer API directly externally',
      body: 'A System or Domain API directly addressable by a partner or the public internet is a flagged anti-pattern. Front it with a purpose-built façade at the Enterprise gateway and keep the internal API private.',
      points: [
        'A façade preserves freedom to refactor internals without breaking external contracts.',
        'Edge-only concerns (metering, WAF, quota plans) get applied in one place.',
      ],
    },
  },
  {
    id: 'consumerCount',
    type: 'choice',
    scoreKey: 'consumerCount',
    title: 'What does the consumer topology look like?',
    subtitle: 'Axis 6 of 7 — drives governance intensity and blast radius. Rubric factor 2 of 6.',
    options: [
      { value: 1, label: 'Single known consumer', hint: 'Exactly one consumer, e.g. the BFF pattern. (Score 1)' },
      { value: 2, label: 'Few internal teams', hint: 'A handful of known internal teams. (Score 2)' },
      { value: 3, label: 'Many internal consumers', hint: 'Broad internal reuse across the organization. (Score 3)' },
      { value: 4, label: 'Unbounded external', hint: 'Self-service external consumers you cannot enumerate. (Score 4)' },
    ],
    guidance: {
      heading: 'Consumer topology sets the blast radius baseline',
      body: 'Single-consumer APIs (like BFFs) can stay lightly governed even if functionally complex. As the consumer set grows, discoverability, versioning discipline, and deprecation notice windows all become mandatory.',
      points: [
        'Being consumed across multiple internal teams is the trigger for Platform-gateway registration in the decision tree.',
        'Unbounded external consumers require a developer portal and formal deprecation with public notice.',
      ],
    },
  },
  {
    id: 'dataSensitivity',
    type: 'choice',
    scoreKey: 'dataSensitivity',
    title: 'What is the highest sensitivity of data the API carries?',
    subtitle: 'Axis 5 of 7 — drives GOVERNANCE INTENSITY and the security baseline. Rubric factor 3 of 6.',
    options: [
      { value: 1, label: 'Public', hint: 'Already publishable — no harm if disclosed. (Score 1)' },
      { value: 2, label: 'Internal', hint: 'Business-internal, non-sensitive. (Score 2)' },
      { value: 3, label: 'Confidential', hint: 'Commercially sensitive; restricted audience. (Score 3)' },
      { value: 4, label: 'Regulated (PII / PHI / PCI)', hint: 'Personal, health, or payment-card data under regulation. (Score 4)' },
    ],
    guidance: {
      heading: 'Regulated data escalates everything',
      body: 'Regulated data (PII/PHI/PCI) crossing a boundary can force edge registration and legal/compliance review even for partner-only traffic. The framework flags "regulated data through a lightly-governed API" as an anti-pattern that must be escalated to Tier 1 governance regardless of consumer count.',
      points: [
        'Score 4 here triggers the escalation factors on the results page.',
        'Security & privacy review plus a legal/compliance gate become mandatory controls.',
      ],
    },
  },
  {
    id: 'blastRadius',
    type: 'choice',
    scoreKey: 'blastRadius',
    title: 'What is the breaking-change blast radius?',
    subtitle: 'If you shipped a breaking change tomorrow, how bad is it? Rubric factor 4 of 6.',
    options: [
      { value: 1, label: 'Low', hint: 'One consumer, coordinated release — easy to fix. (Score 1)' },
      { value: 2, label: 'Medium', hint: 'A few teams need notice and migration time. (Score 2)' },
      { value: 3, label: 'High', hint: 'Many downstream consumers; costly coordinated migration. (Score 3)' },
      { value: 4, label: 'Critical', hint: 'Business-critical flows or external contracts break. (Score 4)' },
    ],
    guidance: {
      heading: 'Blast radius is an escalation factor',
      body: 'High blast radius (many downstream consumers, breaking-change risk) escalates gateway placement to at least Platform tier even if the exposure answer alone would allow App tier.',
      points: [
        'High/Critical → backward-compatibility rules, deprecation policy with notice windows, and contract testing become key controls.',
      ],
    },
  },
  {
    id: 'sla',
    type: 'choice',
    scoreKey: 'sla',
    title: 'What contractual SLA does the API carry?',
    subtitle: 'Rubric factor 5 of 6.',
    options: [
      { value: 1, label: 'None', hint: 'Best-effort; no formal commitment. (Score 1)' },
      { value: 2, label: 'Internal OLA', hint: 'Operational-level agreement between internal teams. (Score 2)' },
      { value: 3, label: 'Partner contract', hint: 'A named partner holds a contractual SLA. (Score 3)' },
      { value: 4, label: 'Public SLA + legal', hint: 'Published SLA with legal exposure. (Score 4)' },
    ],
    guidance: {
      heading: 'SLA formality drives operational governance',
      body: 'The stronger the commitment, the more formal the controls: SLO monitoring and observability for internal OLAs, escalating to formal SLA enforcement at the edge gateway, staged deprecation with partner communications, and change advisory for contracted consumers.',
      points: [],
    },
  },
  {
    id: 'commercialModel',
    type: 'choice',
    scoreKey: 'commercialModel',
    title: 'What is the commercial model?',
    subtitle: 'Axis 7 of 7 — drives governance plus edge features (metering, billing). Rubric factor 6 of 6.',
    options: [
      { value: 1, label: 'None', hint: 'No money changes hands. (Score 1)' },
      { value: 2, label: 'Internal chargeback', hint: 'Internal cost allocation between departments. (Score 2)' },
      { value: 3, label: 'Partner-contracted / metered', hint: 'Usage metered under a partner contract. (Score 3)' },
      { value: 4, label: 'Monetized / metered product', hint: 'Sold as a product with plans and billing. (Score 4)' },
    ],
    guidance: {
      heading: 'Monetization forces the Enterprise tier',
      body: 'Any monetization or metering requirement forces the Enterprise-tier gateway — only the edge APIM has plans, quotas, and billing capability. A monetized API registered only at Platform tier is a flagged anti-pattern.',
      points: [
        'Metering/billing cannot be retrofitted at App or Platform tiers.',
      ],
    },
  },
]

export const SCORE_FACTORS = [
  { key: 'exposure', label: 'Exposure', levels: ['Private-to-app', 'Shared internal', 'Partner', 'Public'] },
  { key: 'consumerCount', label: 'Consumer Count', levels: ['Single', 'Few teams', 'Many internal', 'Unbounded external'] },
  { key: 'dataSensitivity', label: 'Data Sensitivity', levels: ['Public', 'Internal', 'Confidential', 'Regulated (PII/PHI/PCI)'] },
  { key: 'blastRadius', label: 'Breaking-Change Blast Radius', levels: ['Low', 'Medium', 'High', 'Critical'] },
  { key: 'sla', label: 'Contractual SLA', levels: ['None', 'Internal OLA', 'Partner contract', 'Public SLA + legal'] },
  { key: 'commercialModel', label: 'Commercial Model', levels: ['None', 'Chargeback', 'Partner-metered', 'Monetized'] },
]

export const DATA_AUTHORITY_LABELS = {
  sor: 'System of Record',
  reference: 'System of Reference / read-model',
  derived: 'Derived / aggregated',
}

export const PROTOCOL_LABELS = {
  rest: 'REST',
  graphql: 'GraphQL',
  soap: 'SOAP',
  grpc: 'gRPC',
  async: 'Async / Event',
  websocket: 'WebSocket / Streaming',
}
