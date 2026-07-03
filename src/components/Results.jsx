import { useState } from 'react'
import {
  SCORE_FACTORS, GOVERNANCE_TIERS, DATA_AUTHORITY_LABELS, PROTOCOL_LABELS, PRINCIPLES,
} from '../data/framework.js'
import Icon from './icons.jsx'
import Modal from './Modal.jsx'
import DecisionTreeDiagram from './DecisionTreeDiagram.jsx'

const TIER_COLORS = { light: 'var(--tier-1)', managed: 'var(--tier-2)', full: 'var(--tier-3)' }
const GATEWAY_COLORS = { app: 'var(--tier-1)', platform: 'var(--tier-2)', enterprise: 'var(--tier-3)' }

export default function Results({ answers, result, onRestart, onEdit }) {
  const [diagramOpen, setDiagramOpen] = useState(false)
  const {
    scores, totalScore, governance, governanceKey, governanceAdjustments,
    gateway, gatewayKey, gatewayReason, escalations, antiPatterns,
    role, exposureRole, defaults, recommendations,
  } = result

  const name = answers.apiName?.trim() || 'Unnamed API'

  return (
    <main className="results">
      <div className="results-header">
        <div>
          <div className="results-eyebrow">Assessment complete</div>
          <h2>{name}</h2>
          {answers.apiDescription && <p className="results-desc">{answers.apiDescription}</p>}
        </div>
        <div className="results-actions">
          <button className="btn ghost" onClick={() => setDiagramOpen(true)}><Icon name="tree" /> View decision path</button>
          <button className="btn ghost" onClick={onEdit}>← Edit answers</button>
          <button className="btn ghost" onClick={() => window.print()}>Print / PDF</button>
          <button className="btn primary" onClick={onRestart}>Assess another API</button>
        </div>
      </div>

      <Modal open={diagramOpen} onClose={() => setDiagramOpen(false)} title={`Decision path — ${name}`}>
        <DecisionTreeDiagram result={result} />
      </Modal>

      {/* Verdict cards */}
      <div className="verdict-grid">
        <div className="verdict-card" style={{ borderTopColor: TIER_COLORS[governanceKey] }}>
          <div className="verdict-label">Governance Tier</div>
          <div className="verdict-value">{governance.label}</div>
          <div className="verdict-sub">Score band {governance.band} · Typical for: {governance.typicalRoles}</div>
        </div>
        <div className="verdict-card" style={{ borderTopColor: GATEWAY_COLORS[gatewayKey] }}>
          <div className="verdict-label">Gateway Tier</div>
          <div className="verdict-value">{gateway.label}</div>
          <div className="verdict-sub">{gateway.aka} — sits {gateway.sitsAt.toLowerCase()}</div>
        </div>
        <div className="verdict-card" style={{ borderTopColor: '#3b82f6' }}>
          <div className="verdict-label">Governance Score</div>
          <div className="verdict-value big-number">{totalScore}<span className="of"> / 24</span></div>
          <div className="verdict-sub">Sum of 6 rubric factors (each 1–4)</div>
        </div>
      </div>

      {/* Score breakdown */}
      <section className="panel">
        <h3>Score breakdown</h3>
        <div className="score-rows">
          {SCORE_FACTORS.map((f) => (
            <div className="score-row" key={f.key}>
              <div className="score-name">{f.label}</div>
              <div className="score-track">
                <div className={`score-fill s${scores[f.key]}`} style={{ width: `${(scores[f.key] / 4) * 100}%` }} />
              </div>
              <div className="score-val">{scores[f.key]} — {f.levels[scores[f.key] - 1]}</div>
            </div>
          ))}
        </div>
        <div className="band-legend">
          {Object.entries(GOVERNANCE_TIERS).map(([key, t]) => (
            <span key={key} className={`band ${key === governanceKey ? 'active' : ''}`}>
              {t.band} → {t.label}
            </span>
          ))}
        </div>
        {governanceAdjustments.map((a, i) => (
          <p className="adjustment" key={i}>⚠ {a}</p>
        ))}
      </section>

      {/* Classification profile */}
      <section className="panel">
        <h3>Classification profile — the 7 axes</h3>
        <div className="profile-grid">
          <Profile label="Protocol / Interaction Style" value={PROTOCOL_LABELS[answers.protocol]} />
          <Profile label="Functional / Architectural Role" value={role?.label} />
          <Profile label="Exposure / Trust Boundary" value={SCORE_FACTORS[0].levels[scores.exposure - 1]} />
          <Profile label="Data Authority" value={DATA_AUTHORITY_LABELS[answers.dataAuthority]} />
          <Profile label="Data Sensitivity" value={SCORE_FACTORS[2].levels[scores.dataSensitivity - 1]} />
          <Profile label="Consumer Topology" value={SCORE_FACTORS[1].levels[scores.consumerCount - 1]} />
          <Profile label="Commercial Model" value={SCORE_FACTORS[5].levels[scores.commercialModel - 1]} />
        </div>
        {role && (
          <div className="role-detail">
            <strong>{role.label}</strong> — {role.definition} <em>Example: {role.example}.</em>
          </div>
        )}
        {exposureRole && (
          <div className="role-detail exposure">
            <strong>{exposureRole.label}</strong> — {exposureRole.definition}
          </div>
        )}
      </section>

      {/* Gateway reasoning */}
      <section className="panel">
        <h3>Why this gateway tier</h3>
        <p className="reason">{gatewayReason}</p>
        {escalations.length > 0 && (
          <>
            <h4>Escalation factors applied</h4>
            <ul className="escalations">
              {escalations.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </>
        )}
        {defaults && (
          <p className="defaults-note">
            Consolidated-mapping default for this classification: <strong>{defaults.gateway}</strong> gateway,{' '}
            <strong>{defaults.governance}</strong>. {defaults.note}.
            {' '}Defaults are a starting point — escalation factors above override them.
          </p>
        )}
      </section>

      {/* Anti-patterns */}
      {antiPatterns.length > 0 && (
        <section className="panel warning">
          <h3>⚠ Anti-patterns detected ({antiPatterns.length})</h3>
          {antiPatterns.map((ap, i) => (
            <div className="anti-pattern" key={i}>
              <strong>{ap.title}</strong>
              <p>{ap.detail}</p>
              <p className="fix"><span>Recommended fix:</span> {ap.fix}</p>
            </div>
          ))}
        </section>
      )}

      {/* Recommendations */}
      <section className="panel">
        <h3>Full recommendations</h3>
        <div className="rec-grid">
          {recommendations.map((rec) => (
            <div className="rec-card" key={rec.category}>
              <h4>{rec.category}</h4>
              <ul>
                {rec.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Principles reference */}
      <section className="panel muted">
        <h3>Design principles to carry into review</h3>
        <ol className="principles">
          {PRINCIPLES.map((p) => (
            <li key={p.title}><strong>{p.title}.</strong> {p.why}</li>
          ))}
        </ol>
      </section>
    </main>
  )
}

function Profile({ label, value }) {
  return (
    <div className="profile-item">
      <div className="profile-label">{label}</div>
      <div className="profile-value">{value ?? '—'}</div>
    </div>
  )
}
