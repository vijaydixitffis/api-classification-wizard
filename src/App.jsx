import { useMemo, useState } from 'react'
import { QUESTIONS } from './data/framework.js'
import { assess } from './logic/engine.js'
import Icon from './components/icons.jsx'
import Landing from './components/Landing.jsx'
import Wizard from './components/Wizard.jsx'
import Results from './components/Results.jsx'

export default function App() {
  const [view, setView] = useState('landing') // landing | wizard | results
  const [answers, setAnswers] = useState({})
  const [stepIndex, setStepIndex] = useState(0)

  // Questions whose `condition` matches the current answers.
  const activeQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.condition || q.condition(answers)),
    [answers]
  )

  const result = useMemo(() => (view === 'results' ? assess(answers) : null), [view, answers])

  const startWizard = () => {
    setAnswers({})
    setStepIndex(0)
    setView('wizard')
  }

  const goHome = () => {
    setAnswers({})
    setStepIndex(0)
    setView('landing')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <button className="logo-mark" onClick={goHome} title="Back to overview">
            <Icon name="network" size={24} strokeWidth={1.8} />
          </button>
          <div>
            <h1>API Classification &amp; Governance Wizard</h1>
            <p>Classify any API, score its governance intensity, and place it on the right gateway tier</p>
          </div>
          {view !== 'landing' && (
            <button className="btn header-home" onClick={goHome}>Framework overview</button>
          )}
        </div>
      </header>

      {view === 'landing' && <Landing onStart={startWizard} />}

      {view === 'wizard' && (
        <Wizard
          questions={activeQuestions}
          answers={answers}
          setAnswers={setAnswers}
          stepIndex={Math.min(stepIndex, activeQuestions.length - 1)}
          setStepIndex={setStepIndex}
          onFinish={() => setView('results')}
        />
      )}

      {view === 'results' && (
        <Results answers={answers} result={result} onRestart={startWizard} onEdit={() => setView('wizard')} />
      )}

      <footer className="app-footer">
        Based on the API Classification &amp; Governance Framework — 7 classification axes · 3 gateway tiers · 6-factor governance scoring rubric
      </footer>
    </div>
  )
}
