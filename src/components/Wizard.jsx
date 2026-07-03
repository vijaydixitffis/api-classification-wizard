export default function Wizard({ questions, answers, setAnswers, stepIndex, setStepIndex, onFinish }) {
  const q = questions[stepIndex]
  const total = questions.length
  const answered = answers[q.id] !== undefined && answers[q.id] !== ''
  const isLast = stepIndex === total - 1

  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))

  const next = () => {
    if (!answered) return
    if (isLast) onFinish()
    else setStepIndex(stepIndex + 1)
  }
  const back = () => stepIndex > 0 && setStepIndex(stepIndex - 1)

  return (
    <main className="wizard">
      <div className="progress-wrap">
        <div className="progress-labels">
          <span>Question {stepIndex + 1} of {total}</span>
          <span>{Math.round((stepIndex / total) * 100)}% complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(stepIndex / total) * 100}%` }} />
        </div>
        <div className="progress-dots">
          {questions.map((question, i) => (
            <button
              key={question.id}
              className={`dot ${i === stepIndex ? 'current' : ''} ${answers[question.id] !== undefined && answers[question.id] !== '' ? 'done' : ''}`}
              title={question.title}
              onClick={() => i <= stepIndex && setStepIndex(i)}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="wizard-grid">
        <section className="question-card">
          <h2>{q.title}</h2>
          <p className="subtitle">{q.subtitle}</p>

          {q.type === 'text' ? (
            <div className="text-inputs">
              <input
                type="text"
                value={answers[q.id] ?? ''}
                placeholder={q.placeholder}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && next()}
                autoFocus
              />
              <textarea
                rows={2}
                placeholder="Optional one-line description of what the API does"
                value={answers.apiDescription ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, apiDescription: e.target.value }))}
              />
            </div>
          ) : (
            <div className="options" role="radiogroup" aria-label={q.title}>
              {q.options.map((opt) => (
                <button
                  key={String(opt.value)}
                  role="radio"
                  aria-checked={answers[q.id] === opt.value}
                  className={`option ${answers[q.id] === opt.value ? 'selected' : ''}`}
                  onClick={() => setAnswer(opt.value)}
                  onDoubleClick={() => { setAnswer(opt.value); next() }}
                >
                  <span className="option-radio" aria-hidden="true" />
                  <span className="option-body">
                    <span className="option-label">{opt.label}</span>
                    <span className="option-hint">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="nav-buttons">
            <button className="btn ghost" onClick={back} disabled={stepIndex === 0}>← Back</button>
            <button className="btn primary" onClick={next} disabled={!answered}>
              {isLast ? 'Classify this API →' : 'Next →'}
            </button>
          </div>
        </section>

        <aside className="guidance">
          <div className="guidance-badge">Framework guidance</div>
          <h3>{q.guidance.heading}</h3>
          <p>{q.guidance.body}</p>
          {q.guidance.points.length > 0 && (
            <ul>
              {q.guidance.points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
        </aside>
      </div>
    </main>
  )
}
