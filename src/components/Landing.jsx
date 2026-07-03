import { useState } from 'react'
import {
  AXES, ROLES, EXPOSURE_ROLES, GATEWAY_TIERS, GOVERNANCE_TIERS, PRINCIPLES,
} from '../data/framework.js'
import Icon from './icons.jsx'
import Modal from './Modal.jsx'
import DecisionTreeDiagram from './DecisionTreeDiagram.jsx'

const TIER_ORDER = ['light', 'managed', 'full']
const GATEWAY_ORDER = ['app', 'platform', 'enterprise']

export default function Landing({ onStart }) {
  const [diagramOpen, setDiagramOpen] = useState(false)

  return (
    <main className="landing">
      {/* Hero — copy left, stats right */}
      <section className="hero">
        <div className="hero-main">
          <h2>Classify any API. Decide its governance. Place it on the right{' '}gateway.</h2>
          <p>
            There is no single &lsquo;type&rsquo; of API — every API sits at a point across seven independent
            axes. This wizard walks you through them, scores your API against the six-factor governance
            rubric, applies the gateway decision tree with its escalation factors, and hands you a full
            set of recommendations, with framework guidance at every step.
          </p>
          <button className="btn primary hero-cta" onClick={onStart}>Start the wizard →</button>
          <button className="btn ghost diagram-trigger" onClick={() => setDiagramOpen(true)}>
            <Icon name="tree" /> View decision tree diagram
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">10–12</span><span className="stat-label">guided questions</span></div>
          <div className="stat"><span className="stat-num">7</span><span className="stat-label">classification axes</span></div>
          <div className="stat"><span className="stat-num">6</span><span className="stat-label">scoring factors</span></div>
          <div className="stat"><span className="stat-num">3</span><span className="stat-label">governance tiers</span></div>
          <div className="stat"><span className="stat-num">3</span><span className="stat-label">gateway tiers</span></div>
        </div>
      </section>

      {/* How it works */}
      <section className="panel">
        <h3><Icon name="route" /> How the assessment works</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h4>Answer guided questions</h4>
            <p>Tag your API on all seven axes — protocol, role, exposure, data authority, sensitivity, consumer topology, commercial model — with the framework's guidance beside every question.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h4>Get scored &amp; classified</h4>
            <p>Six factors are scored 1–4 and summed (6–24). The score band sets the governance tier; the decision tree — driven mainly by exposure — sets the gateway tier, plus escalation factors.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h4>Receive recommendations</h4>
            <p>A full report: required controls, gateway capabilities, role-specific guidance, security &amp; compliance actions, and any anti-patterns with recommended fixes. Printable as PDF.</p>
          </div>
        </div>
      </section>

      {/* Governance tiers */}
      <section className="panel">
        <h3><Icon name="shield" /> What is a Governance Tier?</h3>
        <p className="section-intro">
          Governance intensity is how much rigor an API's lifecycle demands — reviews, specs, SLAs,
          deprecation discipline. Each of the six rubric factors (exposure, consumer count, data sensitivity,
          blast radius, contractual SLA, commercial model) is scored 1–4, and the total maps to one of three tiers.
        </p>
        <div className="tier-grid">
          {TIER_ORDER.map((key, i) => {
            const t = GOVERNANCE_TIERS[key]
            return (
              <div className={`tier-card depth-${i + 1}`} key={key}>
                <div className="tier-band">Score {t.band}</div>
                <h4>{t.label}</h4>
                <ul>
                  {t.controls.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <div className="tier-typical">Typical: {t.typicalRoles}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Gateway tiers */}
      <section className="panel">
        <h3><Icon name="layers" /> What is a Gateway Tier?</h3>
        <p className="section-intro">
          The gateway tier is <strong>where</strong> an API must be registered and policy enforced. Tiers are
          layered, not exclusive — external traffic traverses Enterprise → Platform → App in sequence, and
          &lsquo;placement&rsquo; means the highest tier at which the API is governed. The dominant driver is the
          <strong> exposure axis</strong>; escalation factors (regulated data, monetization, high blast radius)
          can raise the tier further.
        </p>
        <div className="tier-grid">
          {GATEWAY_ORDER.map((key, i) => {
            const g = GATEWAY_TIERS[key]
            return (
              <div className={`tier-card depth-${i + 1}`} key={key}>
                <div className="tier-band">{g.scope}</div>
                <h4>{g.label}</h4>
                <p className="tier-aka">{g.aka} — sits {g.sitsAt.toLowerCase()}</p>
                <ul>
                  {g.capabilities.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* API types covered */}
      <section className="panel">
        <h3><Icon name="box" /> Which API types are covered?</h3>
        <p className="section-intro">
          The framework classifies APIs by their functional role — what they do architecturally.
          Partner and Public APIs are not separate roles: they are Facade or Process APIs deliberately
          exposed across the trust boundary.
        </p>
        <div className="roles-grid">
          {Object.entries(ROLES).map(([key, r]) => (
            <div className="role-card" key={key}>
              <h4>{r.label}</h4>
              <p>{r.definition}</p>
              <div className="role-meta">
                <span><strong>Reuse:</strong> {r.reuse}</span>
                <span><strong>Owns data:</strong> {r.ownsData}</span>
                <span><strong>Example:</strong> {r.example}</span>
              </div>
              <div className="role-defaults">Usual: {r.usualGateway} gateway · {r.usualGovernance}</div>
            </div>
          ))}
          {Object.entries(EXPOSURE_ROLES).map(([key, r]) => (
            <div className="role-card exposure-card" key={key}>
              <h4>{r.label}</h4>
              <p>{r.definition}</p>
              <div className="role-meta">
                <span><strong>Focus:</strong> {r.governanceFocus}</span>
              </div>
              <div className="role-defaults">Usual: {r.usualGateway} gateway · {r.usualGovernance}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The 7 axes */}
      <section className="panel">
        <h3><Icon name="grid" /> The 7 classification axes</h3>
        <p className="section-intro">
          Every API is tagged on ALL of these axes. They combine — no single axis alone determines
          governance or gateway placement.
        </p>
        <div className="axes-table">
          <div className="axes-row axes-head">
            <span>Axis</span><span>Values</span><span>Primarily drives</span>
          </div>
          {AXES.map((a) => (
            <div className="axes-row" key={a.name}>
              <span className="axis-name">{a.name}</span>
              <span>{a.values}</span>
              <span>{a.drives}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="panel muted">
        <h3><Icon name="compass" /> The design principles behind the framework</h3>
        <ol className="principles">
          {PRINCIPLES.map((p) => (
            <li key={p.title}><strong>{p.title}.</strong> {p.why}</li>
          ))}
        </ol>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta">
        <h3><Icon name="zap" size={20} /> Ready to classify your API?</h3>
        <p>10–12 guided questions, about 5 minutes, full guidance at every step.</p>
        <button className="btn primary hero-cta" onClick={onStart}>Start the wizard →</button>
      </section>

      <Modal open={diagramOpen} onClose={() => setDiagramOpen(false)} title="How the decision tree works">
        <DecisionTreeDiagram />
      </Modal>
    </main>
  )
}
