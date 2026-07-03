import { GATEWAY_TIERS, GOVERNANCE_TIERS } from '../data/framework.js'

// Layout constants for the 940x560 canvas.
const G0 = { x: 60, y: 30, w: 220, h: 46 }
const G1 = { x: 60, y: 110, w: 220, h: 46 }
const TERMINALS = {
  app: { x: 60, y: 210, w: 150, h: 60, label: 'App' },
  platform: { x: 250, y: 210, w: 150, h: 60, label: 'Platform' },
  enterprise: { x: 440, y: 210, w: 150, h: 60, label: 'Enterprise' },
}
const ESCALATIONS = {
  regulated: { x: 680, y: 30, w: 220, h: 46, label: 'Regulated data + exposure ≥ 2', target: 'enterprise', channelY: 284 },
  monetized: { x: 680, y: 90, w: 220, h: 46, label: 'Commercial model ≥ 3 (monetized)', target: 'enterprise', channelY: 290 },
  blastRadius: { x: 680, y: 150, w: 220, h: 46, label: 'Blast radius ≥ 3', target: 'platform', channelY: 296 },
}
const METER = { x: 60, y: 300, w: 800, h: 24 }
const BANDS = [
  { key: 'light', frac: 5 / 19, range: '6–10', label: 'Tier 3 – Light' },
  { key: 'managed', frac: 6 / 19, range: '11–16', label: 'Tier 2 – Managed' },
  { key: 'full', frac: 8 / 19, range: '17–24', label: 'Tier 1 – Full' },
]
const GOV_BOX_Y = 350
const GOV_BOX_H = 70

function bandLayout() {
  let x = METER.x
  return BANDS.map((b) => {
    const w = METER.w * b.frac
    const box = { ...b, x, w }
    x += w
    return box
  })
}

const cx = (n) => n.x + n.w / 2
const cy = (n) => n.y + n.h / 2
const bottomMid = (n) => [cx(n), n.y + n.h]

function DecisionNode({ node, active, lines }) {
  return (
    <g>
      <rect className={`diagram-node${active ? ' active' : ''}`} x={node.x} y={node.y} width={node.w} height={node.h} rx={8} />
      <text x={cx(node)} y={cy(node) + (lines.length > 1 ? -4 : 4)} textAnchor="middle" fontSize="12" fontWeight={active ? 700 : 500}>
        {lines.map((line, i) => (
          <tspan key={i} x={cx(node)} dy={i === 0 ? 0 : 14}>{line}</tspan>
        ))}
      </text>
    </g>
  )
}

function TerminalBox({ node, tierKey, active, title }) {
  return (
    <g>
      <rect
        className={`diagram-node terminal${active ? ` active-${tierKey}` : ''}`}
        x={node.x} y={node.y} width={node.w} height={node.h} rx={8}
      >
        <title>{title}</title>
      </rect>
      <text x={cx(node)} y={cy(node) + 5} textAnchor="middle" fontSize="13">{node.label}</text>
    </g>
  )
}

function EscalationBox({ node, active }) {
  return (
    <g>
      <rect className={`diagram-node${active ? ' active' : ''}`} x={node.x} y={node.y} width={node.w} height={node.h} rx={8} />
      {splitLabel(node.label).map((line, i) => (
        <text key={i} x={cx(node)} y={cy(node) - 4 + i * 13} textAnchor="middle" fontSize="10.5" className={active ? '' : 'diagram-label-muted'}>
          {line}
        </text>
      ))}
      {active && (
        <g transform={`translate(${node.x + node.w - 16}, ${node.y - 4})`}>
          <circle className="diagram-badge" r={8} />
          <text className="diagram-badge-text" textAnchor="middle" y={3}>✓</text>
        </g>
      )}
    </g>
  )
}

function splitLabel(label) {
  if (label.length <= 26) return [label]
  const mid = label.lastIndexOf(' ', 26) === -1 ? label.indexOf(' ') : label.lastIndexOf(' ', 26)
  return [label.slice(0, mid), label.slice(mid + 1)]
}

export default function DecisionTreeDiagram({ result }) {
  const dynamic = !!result
  const scores = result?.scores
  const gatewayKey = result?.gatewayKey
  const governanceKey = result?.governanceKey
  const totalScore = result?.totalScore

  const step1Taken = dynamic && scores.exposure >= 3
  const step2Taken = dynamic && !step1Taken && (scores.exposure === 2 || scores.consumerCount >= 2)
  const step3Taken = dynamic && !step1Taken && !step2Taken

  const escalationActive = {
    regulated: dynamic && scores.dataSensitivity === 4 && scores.exposure >= 2,
    monetized: dynamic && scores.commercialModel >= 3,
    blastRadius: dynamic && scores.blastRadius >= 3,
  }

  const antiOverrideActive = dynamic && totalScore <= 10 && scores.dataSensitivity === 4 && governanceKey === 'full'

  const bands = bandLayout()
  const pointerX = dynamic
    ? Math.min(METER.x + METER.w, Math.max(METER.x, METER.x + ((totalScore - 6) / 18) * METER.w))
    : null

  const [g0BotX, g0BotY] = bottomMid(G0)
  const [g1BotX, g1BotY] = bottomMid(G1)
  const entC = { x: cx(TERMINALS.enterprise), top: TERMINALS.enterprise.y }
  const platC = { x: cx(TERMINALS.platform), top: TERMINALS.platform.y }
  const appC = { x: cx(TERMINALS.app), top: TERMINALS.app.y }

  return (
    <div>
      <div className="diagram-legend">
        {dynamic ? (
          <>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: 'var(--brand)' }} /> Path taken</span>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: 'var(--line)' }} /> Not taken</span>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: '#c0392b' }} /> Escalation fired</span>
          </>
        ) : (
          <>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: 'var(--line)' }} /> Decision step</span>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: 'var(--ink-soft)' }} /> Escalation factor (can raise the tier)</span>
            <span className="diagram-legend-item"><span className="diagram-legend-swatch" style={{ background: 'var(--tier-3)' }} /> Terminal tier</span>
          </>
        )}
      </div>

      <svg className="diagram-svg" viewBox="0 0 940 560">
        {/* Gateway decision flow */}
        <path className={`diagram-edge${step2Taken || step3Taken ? ' active' : ''}`} d={`M${g0BotX},${g0BotY} L${g1BotX},${G1.y}`} />
        <path className={`diagram-edge${step1Taken ? ' active' : ''}`} d={`M${G0.x + G0.w},${cy(G0)} L${entC.x},${cy(G0)} L${entC.x},${entC.top}`} />
        <path className={`diagram-edge${step2Taken ? ' active' : ''}`} d={`M${G1.x + G1.w},${cy(G1)} L${platC.x},${cy(G1)} L${platC.x},${platC.top}`} />
        <path className={`diagram-edge${step3Taken ? ' active' : ''}`} d={`M${g1BotX},${g1BotY} L${appC.x},${g1BotY} L${appC.x},${appC.top}`} />

        <text x={G0.x + G0.w + 14} y={cy(G0) - 8} fontSize="10.5" className="diagram-label-muted">Yes</text>
        <text x={g0BotX + 8} y={(g0BotY + G1.y) / 2 + 4} fontSize="10.5" className="diagram-label-muted">No</text>
        <text x={G1.x + G1.w + 14} y={cy(G1) - 8} fontSize="10.5" className="diagram-label-muted">Yes</text>
        <text x={appC.x + 8} y={g1BotY + 12} fontSize="10.5" className="diagram-label-muted">No</text>

        <DecisionNode node={G0} active={dynamic} lines={['Exposure ≥ 3', '(Partner / Public)?']} />
        <DecisionNode node={G1} active={dynamic && !step1Taken} lines={['Exposure = 2 or', '≥2 team consumers?']} />

        <TerminalBox node={TERMINALS.app} tierKey="app" active={gatewayKey === 'app'} title={GATEWAY_TIERS.app.label} />
        <TerminalBox node={TERMINALS.platform} tierKey="platform" active={gatewayKey === 'platform'} title={GATEWAY_TIERS.platform.label} />
        <TerminalBox node={TERMINALS.enterprise} tierKey="enterprise" active={gatewayKey === 'enterprise'} title={GATEWAY_TIERS.enterprise.label} />

        {/* Escalation factors */}
        {Object.entries(ESCALATIONS).map(([key, esc]) => {
          const target = TERMINALS[esc.target]
          const [botX, botY] = bottomMid(esc)
          const targetX = cx(target)
          return (
            <path
              key={key}
              className={`diagram-edge escalation${escalationActive[key] ? ' active' : ''}`}
              d={`M${botX},${botY} L${botX},${esc.channelY} L${targetX},${esc.channelY} L${targetX},${target.y + target.h}`}
            />
          )
        })}
        <EscalationBox node={ESCALATIONS.regulated} active={escalationActive.regulated} />
        <EscalationBox node={ESCALATIONS.monetized} active={escalationActive.monetized} />
        <EscalationBox node={ESCALATIONS.blastRadius} active={escalationActive.blastRadius} />

        {/* Anti-pattern override: regulated data forcing Tier 1 governance */}
        {(!dynamic || antiOverrideActive) && (() => {
          const full = bands.find((b) => b.key === 'full')
          const fullBoxCx = full.x + full.w / 2
          const [botX, botY] = bottomMid(ESCALATIONS.regulated)
          return (
            <path
              className={`diagram-edge escalation${antiOverrideActive ? ' active' : ''}`}
              d={`M${botX},${botY} L910,${botY} L910,330 L${fullBoxCx},330 L${fullBoxCx},${GOV_BOX_Y}`}
            />
          )
        })()}

        {/* Governance scoring flow */}
        {bands.map((b) => (
          <rect
            key={b.key}
            className="diagram-meter-segment"
            x={b.x} y={METER.y} width={b.w} height={METER.h}
            fill={b.key === 'light' ? 'var(--tier-1)' : b.key === 'managed' ? 'var(--tier-2)' : 'var(--tier-3)'}
            opacity={dynamic && governanceKey !== b.key ? 0.35 : 1}
          />
        ))}
        {bands.map((b) => (
          <text key={b.key} x={b.x + b.w / 2} y={METER.y + METER.h / 2 + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
            {b.range}
          </text>
        ))}
        {dynamic && pointerX !== null && (
          <polygon className="diagram-meter-pointer" points={`${pointerX - 7},${METER.y - 12} ${pointerX + 7},${METER.y - 12} ${pointerX},${METER.y - 1}`} />
        )}
        {dynamic && pointerX !== null && (
          <text x={pointerX} y={METER.y - 16} textAnchor="middle" fontSize="11" fontWeight="700">{totalScore}</text>
        )}

        {bands.map((b) => (
          <g key={b.key}>
            <rect
              className={`diagram-node terminal${governanceKey === b.key ? ` active-${b.key === 'full' ? 'full' : b.key}` : ''}`}
              x={b.x} y={GOV_BOX_Y} width={b.w} height={GOV_BOX_H} rx={8}
            >
              <title>{GOVERNANCE_TIERS[b.key].label}</title>
            </rect>
            <text x={b.x + b.w / 2} y={GOV_BOX_Y + GOV_BOX_H / 2 + 5} textAnchor="middle" fontSize="13">
              {b.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
