import { useMemo, useState } from 'react'
import { QUESTIONS } from './data/framework.js'
import { assess } from './logic/engine.js'
import Wizard from './components/Wizard.jsx'
import Results from './components/Results.jsx'

export default function App() {
  const [answers, setAnswers] = useState({})
  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  // Questions whose `condition` matches the current answers.
  const activeQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.condition || q.condition(answers)),
    [answers]
  )

  const result = useMemo(() => (finished ? assess(answers) : null), [finished, answers])

  const restart = () => {
    setAnswers({})
    setStepIndex(0)
    setFinished(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="logo-mark">API</div>
          <div>
            <h1>API Classification &amp; Governance Wizard</h1>
            <p>Classify any API, score its governance intensity, and place it on the right gateway tier</p>
          </div>
        </div>
      </header>

      {finished ? (
        <Results answers={answers} result={result} onRestart={restart} onEdit={() => setFinished(false)} />
      ) : (
        <Wizard
          questions={activeQuestions}
          answers={answers}
          setAnswers={setAnswers}
          stepIndex={Math.min(stepIndex, activeQuestions.length - 1)}
          setStepIndex={setStepIndex}
          onFinish={() => setFinished(true)}
        />
      )}

      <footer className="app-footer">
        Based on the API Classification &amp; Governance Framework — 7 classification axes · 3 gateway tiers · 6-factor governance scoring rubric
      </footer>
    </div>
  )
}
