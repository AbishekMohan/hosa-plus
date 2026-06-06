import { useEffect, useRef, useState } from 'react'
import { SQT1_EVENTS } from '../data/events.js'
import { readinessAreas } from '../data/hosaDashboardData.js'
import { callGemini, callGeminiChat } from '../lib/geminiService.js'

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm your HOSA AI study coach powered by Gemini. Ask me anything about your SQT events, or click the tools on the left to generate study materials for any event.",
}

function Analytics() {
  const [apiKey] = useState('')
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('medical-terminology')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function requireKey() {
    return true
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    if (!requireKey()) return
    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const reply = await callGeminiChat(apiKey, updated)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠ ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  async function runTool(toolKey) {
    if (!requireKey()) return
    const name = SQT1_EVENTS.find((e) => e.id === selectedEvent)?.name || selectedEvent
    const prompts = {
      guide: `Generate a concise study guide for the HOSA SQT event: "${name}". Include: overview, key concepts, important terms (with definitions), common exam topics, and 3–5 targeted study tips. Use clear headers.`,
      questions: `Generate 5 HOSA-level multiple-choice practice questions for the event: "${name}". For each, show the question, 4 options labeled A–D, the correct answer, and a one-sentence explanation. Number them 1–5.`,
      mindmap: `Create a structured concept hierarchy (text mind map) for the HOSA SQT event: "${name}". Show the main topic, major subtopic branches, and key terms under each. Use indentation or dashes to show hierarchy.`,
    }
    const label = toolKey === 'guide' ? 'Study Guide' : toolKey === 'questions' ? 'Practice Questions' : 'Mind Map'
    setMessages((prev) => [...prev, { role: 'user', content: `[Generate ${label} → ${name}]` }])
    setLoading(true)
    try {
      const reply = await callGemini(apiKey, prompts[toolKey])
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠ ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="v-aihub" className="view active">
      <div className="aihub-wrap">
        {/* ── Left sidebar ── */}
        <div className="aihub-left">
          <div className="aihub-left-hdr">
            <div className="aihub-left-title">AI Hub</div>
            <div className="aihub-session-info">
              <div className="aihub-session-dot" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.55)' }} />
              <span className="aihub-session-txt">AI Active</span>
            </div>
          </div>

          <div style={{ padding: '10px 11px 6px' }}>
            <div
              className="aihub-add-btn"
              style={{
                textAlign: 'center',
                background: 'rgba(9,87,134,0.06)',
                color: 'var(--navy)',
                border: '1px solid rgba(9,87,134,0.12)',
                fontSize: 10,
                padding: '7px 0',
                borderRadius: 8,
                fontFamily: 'var(--mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              ✦ Gemini 2.0 Active
            </div>
          </div>


          <div style={{ padding: '4px 11px 8px' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Event Context</div>
            <select
              className="aihub-mode-select"
              style={{ width: '100%' }}
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              {SQT1_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: '0 0 6px', borderTop: '1px solid #edf0f7' }}>
            <div style={{ padding: '8px 11px 4px', fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Generate</div>
            <div className="aihub-srow featured-row" onClick={() => runTool('guide')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="aihub-srow-label">Study Guide</div>
                <div className="aihub-srow-sub">Key concepts + exam tips</div>
              </div>
              <span className="aihub-srow-arrow">›</span>
            </div>
            <div className="aihub-srow" onClick={() => runTool('questions')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="aihub-srow-label">Practice Questions</div>
                <div className="aihub-srow-sub">5 MCQs with answers</div>
              </div>
              <span className="aihub-srow-arrow">›</span>
            </div>
            <div className="aihub-srow" onClick={() => runTool('mindmap')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="aihub-srow-label">Concept Map</div>
                <div className="aihub-srow-sub">Visual topic hierarchy</div>
              </div>
              <span className="aihub-srow-arrow">›</span>
            </div>
          </div>

          <div style={{ padding: '10px 11px', borderTop: '1px solid #edf0f7', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Readiness</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {readinessAreas.map((area) => (
                <div key={area.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t2)', marginBottom: 3 }}>
                    <span>{area.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>{area.score}%</span>
                  </div>
                  <div className="metric-track">
                    <div className={`metric-fill ${area.status}`} style={{ width: `${area.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="aihub-right" style={{ gridColumn: '2 / -1' }}>
          <div className="aihub-right-hdr">
            <div className="aihub-right-hdr-title">
              <span style={{ fontSize: 13, marginRight: 4 }}>✦</span>
              AI Study Coach
            </div>
            <div className="aihub-right-hdr-timer">
              <span>Gemini 2.0 Flash</span>
              <button
                type="button"
                className="btn btn-b"
                style={{ padding: '4px 10px', fontSize: 10 }}
                onClick={() => setMessages([WELCOME])}
              >
                Clear Chat
              </button>
            </div>
          </div>

          <div className="aihub-chat">
            {messages.map((msg, i) => (
              <div key={i} className={`aihub-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                <div className="aihub-msg-lbl">{msg.role === 'user' ? 'You' : 'AI Coach'}</div>
                <div className="aihub-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="aihub-msg ai">
                <div className="aihub-msg-lbl">AI Coach</div>
                <div className="aihub-msg-bubble" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--t3)', fontSize: 12 }}>
                  <span className="ai-typing-cursor" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="aihub-input-bar">
            <input
              className="aihub-inp"
              placeholder="Ask about medical terminology, drug classes, exam strategies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              disabled={loading}
            />
            <button
              className="aihub-send"
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

