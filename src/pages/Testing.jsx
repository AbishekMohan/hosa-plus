import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SQT1_EVENTS } from '../data/events.js'
import {
  behavioralHealthQuiz,
  biomedicalEquipmentQuiz,
  dentalTerminologyQuiz,
  healthInformaticsQuiz,
  healthcareAdministrationQuiz,
  humanGrowthDevelopmentQuiz,
  medicalLawEthicsQuiz,
  medicalMathQuiz,
  medicalReadingQuiz,
  medicalSpellingQuiz,
  medicalTerminologyQuiz,
  nutritionQuiz,
  pathophysiologyQuiz,
  pharmacologyQuiz,
  worldHealthDisparitiesQuiz,
} from '../data/flashcards/index.js'

const QUIZ_MAP = {
  'behavioral-health': behavioralHealthQuiz,
  'biomedical-equipment': biomedicalEquipmentQuiz,
  'dental-terminology': dentalTerminologyQuiz,
  'health-informatics': healthInformaticsQuiz,
  'healthcare-administration': healthcareAdministrationQuiz,
  'human-growth-development': humanGrowthDevelopmentQuiz,
  'medical-law-ethics': medicalLawEthicsQuiz,
  'medical-math': medicalMathQuiz,
  'medical-reading': medicalReadingQuiz,
  'medical-spelling': medicalSpellingQuiz,
  'medical-terminology': medicalTerminologyQuiz,
  'nutrition': nutritionQuiz,
  'pathophysiology': pathophysiologyQuiz,
  'pharmacology': pharmacologyQuiz,
  'world-health-disparities': worldHealthDisparitiesQuiz,
}

const LETTER = ['A', 'B', 'C', 'D']
const COUNTS = [10, 25, 50, 100]
const TIMER_MODES = [
  { key: 'untimed', label: 'Untimed', icon: '▶' },
  { key: 'timed', label: 'Timed', sub: '30s/q', icon: '◷' },
  { key: 'exam', label: 'Exam Mode', icon: '!' },
]

function normalize(q) {
  if ('answerIndex' in q) return { ...q, answer: q.options[q.answerIndex] }
  return q
}

function shuffleSlice(arr, count) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length)).map(normalize)
}

function saveScore(eventId, score, total) {
  try {
    const key = 'hosa-quiz-scores'
    const existing = JSON.parse(localStorage.getItem(key) || '{}')
    const prev = existing[eventId] || { attempts: 0, highScore: 0 }
    const pct = Math.round((score / total) * 100)
    existing[eventId] = {
      attempts: prev.attempts + 1,
      highScore: Math.max(prev.highScore, pct),
      lastScore: pct,
      lastDate: new Date().toLocaleDateString(),
    }
    localStorage.setItem(key, JSON.stringify(existing))
  } catch (_) {}
}

function Testing() {
  const [eventId, setEventId] = useState('medical-terminology')
  const [questionCount, setQuestionCount] = useState(10)
  const [timerMode, setTimerMode] = useState('untimed')
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResults, setShowResults] = useState(false)
  const [examAnswers, setExamAnswers] = useState([])
  const timerRef = useRef(null)

  const availableQuestions = QUIZ_MAP[eventId] || []
  const hasQuestions = availableQuestions.length > 0
  const current = questions[currentIndex]
  const isLocked = selectedIndex !== null || (timerMode === 'exam')
  const isExam = timerMode === 'exam'

  const progress = useMemo(() => {
    if (!questions.length) return 0
    return ((currentIndex + (selectedIndex !== null ? 1 : 0)) / questions.length) * 100
  }, [currentIndex, selectedIndex, questions.length])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (!started || timerMode !== 'timed') return
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setSelectedIndex(-1)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [started, timerMode])

  useEffect(() => {
    if (started && timerMode === 'timed') resetTimer()
    return () => clearInterval(timerRef.current)
  }, [currentIndex, started, timerMode, resetTimer])

  function beginTest() {
    const qs = shuffleSlice(availableQuestions, questionCount)
    setQuestions(qs)
    setCurrentIndex(0)
    setSelectedIndex(null)
    setCorrect(0)
    setTimeLeft(30)
    setExamAnswers(new Array(Math.min(questionCount, availableQuestions.length)).fill(null))
    setShowResults(false)
    setStarted(true)
  }

  function choose(optionIndex) {
    if (isLocked && !isExam) return
    if (isExam) {
      setExamAnswers((prev) => {
        const next = [...prev]
        next[currentIndex] = optionIndex
        return next
      })
      return
    }
    clearInterval(timerRef.current)
    setSelectedIndex(optionIndex)
    if (optionIndex === current.answerIndex) setCorrect((c) => c + 1)
  }

  function next() {
    if (currentIndex >= questions.length - 1) {
      if (isExam) {
        const score = examAnswers.reduce((total, ans, i) => total + (ans === questions[i]?.answerIndex ? 1 : 0), 0)
        setCorrect(score)
      }
      saveScore(eventId, isExam ? examAnswers.reduce((t, a, i) => t + (a === questions[i]?.answerIndex ? 1 : 0), 0) : correct, questions.length)
      setShowResults(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedIndex(null)
  }

  function restart() {
    setStarted(false)
    setShowResults(false)
    setQuestions([])
  }

  if (!started) {
    return (
      <div id="v-quiz" className="view active">
        <div className="ph">
          <div>
            <div className="ph-eye">SQT — Assessment</div>
            <div className="ph-title">Testing</div>
            <div className="ph-sub">Configure your test, then compete at your level</div>
          </div>
        </div>

        <div className="test-cfg">
          <div className="test-cfg-eyebrow">Practice Engine</div>
          <div className="test-cfg-title">Practice Testing</div>
          <div className="test-cfg-sub">Mirrors real HOSA competition format. Select your parameters below.</div>

          <div className="test-cfg-section">
            <div className="test-cfg-label">Event</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {SQT1_EVENTS.map((ev) => {
                const hasQ = (QUIZ_MAP[ev.id] || []).length > 0
                const isSelected = ev.id === eventId
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => hasQ && setEventId(ev.id)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${isSelected ? 'var(--navy)' : 'var(--ln2)'}`,
                      background: isSelected ? 'var(--navy)' : hasQ ? 'var(--card-bg)' : 'var(--beige2)',
                      color: isSelected ? 'white' : hasQ ? 'var(--t1)' : 'var(--t3)',
                      cursor: hasQ ? 'pointer' : 'not-allowed',
                      fontSize: 11, textAlign: 'left', transition: 'all 0.13s',
                      opacity: hasQ ? 1 : 0.55,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                    }}
                  >
                    <span>{ev.name}</span>
                    {hasQ
                      ? <span style={{ fontFamily: 'var(--mono)', fontSize: 8, opacity: 0.7 }}>{(QUIZ_MAP[ev.id] || []).length}q</span>
                      : <span style={{ fontFamily: 'var(--mono)', fontSize: 8 }}>soon</span>
                    }
                  </button>
                )
              })}
            </div>
          </div>

          <div className="test-cfg-section">
            <div className="test-cfg-label">Question Count</div>
            <div className="qcount-opts">
              {COUNTS.map((c) => {
                const max = availableQuestions.length
                const disabled = c > max
                return (
                  <button
                    key={c}
                    type="button"
                    className={`qcount-opt ${questionCount === c && !disabled ? 'sel' : ''}`}
                    style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onClick={() => !disabled && setQuestionCount(c)}
                  >
                    {c}{disabled ? ` (max ${max})` : ''}
                  </button>
                )
              })}
            </div>
            {!hasQuestions && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--maroon-tint)', border: '1px solid var(--maroon-border)', color: 'var(--maroon)', fontSize: 11, marginTop: 4 }}>
                No questions available for this event yet. Select another event above.
              </div>
            )}
          </div>

          <div className="test-cfg-section">
            <div className="test-cfg-label">Timer</div>
            <div className="timer-toggle-row">
              {TIMER_MODES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`timer-opt ${timerMode === t.key ? 'sel' : ''}`}
                  onClick={() => setTimerMode(t.key)}
                >
                  <span>{t.icon}</span>
                  {t.label}
                  {t.sub && <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>{t.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            className="test-begin-btn"
            type="button"
            disabled={!hasQuestions}
            onClick={beginTest}
            style={{ opacity: hasQuestions ? 1 : 0.4, cursor: hasQuestions ? 'pointer' : 'not-allowed' }}
          >
            Begin Test →
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const pct = Math.round((correct / questions.length) * 100)
    const grade = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Passing' : 'Needs Work'
    const gradeColor = pct >= 90 ? 'var(--green)' : pct >= 75 ? 'var(--navy)' : pct >= 60 ? 'var(--amber)' : 'var(--maroon)'
    return (
      <div id="v-quiz" className="view active">
        <div className="quiz5-result">
          <div className="quiz5-session-saved">✓ Score Saved</div>
          <div className="quiz5-result-score" style={{ color: gradeColor }}>{pct}%</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: gradeColor, marginBottom: 6, fontWeight: 600 }}>{grade}</div>
          <div className="quiz5-result-sub">{correct} of {questions.length} correct · {SQT1_EVENTS.find(e => e.id === eventId)?.name}</div>

          <div className="quiz5-cat-bars">
            <div className="quiz5-cat-row">
              <div className="quiz5-cat-lbl">Correct</div>
              <div className="quiz5-cat-track"><div className="quiz5-cat-fill" style={{ width: `${pct}%`, background: 'var(--grad-navy)' }} /></div>
              <div className="quiz5-cat-val">{correct}</div>
            </div>
            <div className="quiz5-cat-row">
              <div className="quiz5-cat-lbl">Incorrect</div>
              <div className="quiz5-cat-track"><div className="quiz5-cat-fill" style={{ width: `${100 - pct}%`, background: 'var(--grad-maroon)' }} /></div>
              <div className="quiz5-cat-val">{questions.length - correct}</div>
            </div>
          </div>

          {isExam && (
            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Question Review</div>
              {questions.map((q, i) => {
                const userAns = examAnswers[i]
                const isRight = userAns === q.answerIndex
                return (
                  <div key={q.id} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${isRight ? 'rgba(5,150,105,0.2)' : 'var(--maroon-border)'}`, background: isRight ? 'rgba(5,150,105,0.04)' : 'var(--maroon-tint)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--t1)', marginBottom: 4 }}>{i + 1}. {q.question}</div>
                    <div style={{ fontSize: 11, color: isRight ? 'var(--green)' : 'var(--maroon)' }}>
                      {isRight ? '✓' : '✗'} Your answer: {userAns !== null ? q.options[userAns] : 'Unanswered'} {!isRight && `→ Correct: ${q.options[q.answerIndex]}`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>{q.explanation}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-p" type="button" onClick={beginTest}>Retake Test</button>
            <button className="btn btn-b" type="button" onClick={restart}>Configure New Test</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="v-quiz" className="view active">
      <div className="quiz5-wrap">
        <div className="quiz5-session-saved">✓ Session Active</div>

        <div className="quiz5-topbar">
          <div className="quiz5-counter">Q {String(currentIndex + 1).padStart(2, '0')} / {questions.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isExam && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)' }}>{correct} correct</span>}
            {timerMode === 'timed' ? (
              <div className={`quiz5-timer-live ${timeLeft <= 8 ? 'urgent' : ''}`}>
                {String(timeLeft).padStart(2, '0')}s
              </div>
            ) : (
              <div className="quiz5-timer-live" style={{ fontSize: 12, color: isExam ? 'var(--amber)' : 'var(--t3)' }}>
                {isExam ? 'EXAM' : 'UNTIMED'}
              </div>
            )}
          </div>
        </div>

        <div className="quiz5-progress">
          <div className="quiz5-prog-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz5-q">{current.question}</div>

        <div>
          {current.options.map((option, i) => {
            let stateClass = ''
            if (!isExam && selectedIndex !== null) {
              if (i === current.answerIndex) stateClass = 'correct'
              else if (i === selectedIndex) stateClass = 'wrong'
            }
            const examSelected = isExam && examAnswers[currentIndex] === i
            return (
              <button
                key={option}
                type="button"
                className={`quiz5-opt ${stateClass}`}
                style={examSelected ? { borderColor: 'var(--navy)', background: 'var(--navy-tint)', borderLeftWidth: 4 } : {}}
                onClick={() => choose(i)}
              >
                <span className="quiz5-opt-ltr">{LETTER[i]}</span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>

        {!isExam && selectedIndex !== null && (
          <>
            <div className="quiz5-explain-card">
              <div className={`quiz5-explain-hdr ${selectedIndex === current.answerIndex ? 'correct-hdr' : 'wrong-hdr'}`}>
                {selectedIndex === current.answerIndex ? '✓ Correct' : '✗ Incorrect'}
              </div>
              <div className="quiz5-explain-body">{current.explanation}</div>
            </div>
            <button className="btn btn-p" type="button" onClick={next} style={{ marginTop: 4 }}>
              {currentIndex === questions.length - 1 ? 'Finish Test →' : 'Next Question →'}
            </button>
          </>
        )}

        {isExam && (
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="btn btn-b" type="button" onClick={next} disabled={examAnswers[currentIndex] === null}>
              {currentIndex === questions.length - 1 ? 'Submit Exam →' : 'Next →'}
            </button>
            {currentIndex > 0 && (
              <button className="btn btn-b" type="button" onClick={() => { setCurrentIndex((i) => i - 1) }}>← Back</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Testing
