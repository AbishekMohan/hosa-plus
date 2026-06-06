import { useMemo, useState } from 'react'

const getRelativeDate = (offsetDays) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const r = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${r}`
}

const SEED_TASKS = [
  { id: 1, title: 'Review cardiovascular pharmacology', cat: 'study', pri: 'high', col: 'today', done: false, date: getRelativeDate(0) },
  { id: 2, title: 'Run Emergency Prep scenario', cat: 'practice', pri: 'high', col: 'today', done: false, date: getRelativeDate(0) },
  { id: 3, title: 'Complete A&P deck units 7-9', cat: 'study', pri: 'med', col: 'week', done: false, date: getRelativeDate(2) },
  { id: 4, title: 'Peer review session prep', cat: 'chapter', pri: 'low', col: 'week', done: false, date: getRelativeDate(4) },
  { id: 5, title: 'Glossary: top 50 drug terms', cat: 'study', pri: 'low', col: 'backlog', done: false, date: getRelativeDate(6) },
]

const COLUMNS = [
  ['today', 'Today', 'var(--maroon)'],
  ['week', 'This Week', 'var(--navy)'],
  ['backlog', 'Backlog', 'var(--beige3)'],
]

const CATS = ['study', 'practice', 'event', 'chapter']
const PRI = ['high', 'med', 'low']
const FILTER_LABELS = ['All', 'Study', 'Practice', 'Event', 'Chapter']

function loadTasks() {
  try {
    const saved = localStorage.getItem('hosa-planner-tasks')
    return saved ? JSON.parse(saved) : SEED_TASKS
  } catch (_) {
    return SEED_TASKS
  }
}

function saveTasks(tasks) {
  try { localStorage.setItem('hosa-planner-tasks', JSON.stringify(tasks)) } catch (_) {}
}

function getCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

import { useEffect } from 'react'

function PlannerPage() {
  const [tasks, setTasks] = useState(loadTasks)
  const [draft, setDraft] = useState('')
  const [draftCat, setDraftCat] = useState('study')
  const [draftPri, setDraftPri] = useState('med')
  const [draftCol, setDraftCol] = useState('today')
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState('board')

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const todayDate = now.getDate()
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth()

  // Interactive Calendar & Due Date States
  const [selectedDate, setSelectedDate] = useState(() => getRelativeDate(0))
  const [showAllDates, setShowAllDates] = useState(true)

  // Pomodoro Focus Mode States
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [focusTaskId, setFocusTaskId] = useState(null)
  const [timeLeft, setTimeLeft] = useState(1500) // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false)

  // Manage Pomodoro Timer Interval
  useEffect(() => {
    let interval = null
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setTimerRunning(false)
      // Auto-trigger completion behavior or sound alert if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav')
        audio.play()
      } catch (_) {}
      alert('Focus session complete! Take a short break.')
      setTimeLeft(300) // Default to 5 min break
    }
    return () => clearInterval(interval)
  }, [timerRunning, timeLeft])

  // Get active focus task details
  const activeFocusTask = useMemo(() => {
    return tasks.find((t) => t.id === focusTaskId) || tasks.find((t) => !t.done) || null
  }, [tasks, focusTaskId])

  // Sync focusTaskId if active task becomes completed/deleted
  useEffect(() => {
    if (activeFocusTask && focusTaskId !== activeFocusTask.id) {
      setFocusTaskId(activeFocusTask.id)
    }
  }, [activeFocusTask, focusTaskId])

  function update(next) {
    setTasks(next)
    saveTasks(next)
  }

  function addTask() {
    const title = draft.trim()
    if (!title) return
    const newTask = {
      id: Date.now(),
      title,
      cat: draftCat,
      pri: draftPri,
      col: draftCol,
      done: false,
      date: showAllDates ? getRelativeDate(0) : selectedDate
    }
    update([...tasks, newTask])
    setDraft('')
  }

  function toggleDone(id) {
    update(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id) {
    update(tasks.filter((t) => t.id !== id))
  }

  function moveTask(id, col) {
    update(tasks.map((t) => t.id === id ? { ...t, col } : t))
  }

  function cyclePri(id) {
    update(tasks.map((t) => {
      if (t.id !== id) return t
      const next = { high: 'med', med: 'low', low: 'high' }[t.pri] || 'med'
      return { ...t, pri: next }
    }))
  }

  const filtered = useMemo(() => {
    let list = tasks
    if (filter !== 'All') {
      list = list.filter((t) => t.cat === filter.toLowerCase())
    }
    if (!showAllDates) {
      list = list.filter((t) => t.date === selectedDate)
    }
    return list
  }, [tasks, filter, showAllDates, selectedDate])

  const done = tasks.filter((t) => t.done).length
  const high = tasks.filter((t) => t.pri === 'high' && !t.done).length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const grouped = useMemo(() => Object.fromEntries(
    COLUMNS.map(([key]) => [key, filtered.filter((t) => t.col === key)])
  ), [filtered])

  const calCells = useMemo(() => getCalendar(calYear, calMonth), [calYear, calMonth])

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11) }
    else setCalMonth((m) => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0) }
    else setCalMonth((m) => m + 1)
  }

  // Format dates for UI display
  const formatFriendlyDate = (dateStr) => {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const d = new Date(parts[0], parts[1] - 1, parts[2])
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div id="v-planner" className="view active">
      {/* Pomodoro Focus Mode Modal Overlay */}
      {showFocusMode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(4,28,44,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32, width: 480,
            boxShadow: '0 25px 70px rgba(9,87,134,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>🎯 STUDY FOCUS SESSION</div>
              <button 
                type="button" 
                onClick={() => { setShowFocusMode(false); setTimerRunning(false) }}
                style={{ background: 'transparent', border: 'none', fontSize: 22, color: 'var(--t3)', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Pomodoro Circle Timer */}
            <div style={{
              position: 'relative', width: 180, height: 180, borderRadius: '50%',
              background: 'linear-gradient(145deg, #f0f4f8, #d9e3ed)',
              boxShadow: 'inset 8px 8px 16px #c4d0dc, inset -8px -8px 16px #ffffff, 0 10px 20px rgba(9,87,134,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--navy)' }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                {timerRunning ? 'Focusing...' : 'Paused'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button 
                className="btn btn-p" 
                type="button" 
                onClick={() => setTimerRunning(!timerRunning)}
                style={{ padding: '8px 24px', fontSize: 12, borderRadius: 20 }}
              >
                {timerRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button 
                className="btn btn-b" 
                type="button" 
                onClick={() => { setTimeLeft(1500); setTimerRunning(false) }}
                style={{ padding: '8px 16px', fontSize: 12, borderRadius: 20 }}
              >
                Reset
              </button>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid #edf0f7', paddingTop: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 10 }}>Current Target Task</div>
              {activeFocusTask ? (
                <div style={{
                  padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--ln2)',
                  background: 'rgba(9,87,134,0.02)', display: 'flex', alignItems: 'center', justifyItems: 'space-between', width: '100%', boxSizing: 'border-box'
                }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{activeFocusTask.title}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                      <span className={`pln-cat-badge cat-${activeFocusTask.cat}`}>{activeFocusTask.cat}</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{activeFocusTask.pri} priority</span>
                    </div>
                  </div>
                  <button
                    className={`pln-task-check ${activeFocusTask.done ? 'checked' : ''}`}
                    onClick={() => toggleDone(activeFocusTask.id)}
                    type="button"
                    style={{ flexShrink: 0 }}
                  >
                    {activeFocusTask.done ? '✓' : ''}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', padding: '10px 0' }}>No active tasks remaining. Add a task to focus on!</div>
              )}
            </div>

            {/* Task selector in Focus Mode */}
            {tasks.filter((t) => !t.done && t.id !== activeFocusTask?.id).length > 0 && (
              <div style={{ width: '100%', marginTop: 16 }}>
                <select 
                  style={{ 
                    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--ln)', 
                    fontSize: 11, outline: 'none', background: 'var(--beige2)', cursor: 'pointer' 
                  }}
                  value={focusTaskId || ''}
                  onChange={(e) => {
                    setFocusTaskId(Number(e.target.value))
                    setTimeLeft(1500)
                    setTimerRunning(false)
                  }}
                >
                  <option value="" disabled>Switch focus to another task...</option>
                  {tasks.filter((t) => !t.done).map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.cat})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ph">
        <div>
          <div className="ph-eye">Organize</div>
          <div className="ph-title">My Planner</div>
          <div className="ph-sub">Board · Calendar · Focus Mode · Weekly Schedule</div>
        </div>
      </div>

      <div className="pln-shell">
        <div className="pln-topbar">
          <div className="pln-add-bar">
            <span className="pln-add-ico">+</span>
            <input
              className="pln-add-inp"
              placeholder="Add a task..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <select
              value={draftCat}
              onChange={(e) => setDraftCat(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 11, color: 'var(--t3)', outline: 'none', cursor: 'pointer', padding: '0 4px' }}
            >
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={draftPri}
              onChange={(e) => setDraftPri(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 11, color: 'var(--t3)', outline: 'none', cursor: 'pointer', padding: '0 4px' }}
            >
              {PRI.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={draftCol}
              onChange={(e) => setDraftCol(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 11, color: 'var(--t3)', outline: 'none', cursor: 'pointer', padding: '0 4px', marginRight: 8 }}
            >
              {COLUMNS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
            <button className="pln-add-btn" type="button" onClick={addTask}>Add Task</button>
          </div>
          <div className="pln-view-toggle" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn btn-p"
              type="button"
              onClick={() => {
                setShowFocusMode(true)
                setTimeLeft(1500)
                setTimerRunning(false)
              }}
              style={{ padding: '6px 12px', fontSize: 10.5, borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🎯 Focus Mode
            </button>
            <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--ln2)' }}>
              <div className={`pln-vtab ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')} style={{ cursor: 'pointer' }}>■ Board</div>
              <div className={`pln-vtab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} style={{ cursor: 'pointer' }}>≡ List</div>
            </div>
          </div>
        </div>

        {/* Date Filter Notification Banner */}
        {!showAllDates && (
          <div style={{
            background: 'var(--navy-tint)', border: '1.5px solid rgba(9,87,134,0.18)', borderRadius: 10,
            padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 600 }}>
              📅 Calendar Filter: showing tasks due on <span style={{ textDecoration: 'underline' }}>{formatFriendlyDate(selectedDate)}</span>
            </div>
            <button
              type="button"
              className="btn btn-b"
              onClick={() => setShowAllDates(true)}
              style={{ padding: '3px 9px', fontSize: 9.5 }}
            >
              Clear Filter (Show All)
            </button>
          </div>
        )}

        <div className="pln-stats-bar">
          <Stat value={tasks.length} label="Total Tasks" tone="sn-navy" />
          <Stat value={done} label="Done" tone="sn-ok" />
          <Stat value={high} label="High Priority" tone="sn-red" />
          <div className="pln-progress-pill">
            <div className="pln-prog-label">Progress</div>
            <div className="pln-prog-track"><div className="pln-prog-fill" style={{ width: `${progress}%` }} /></div>
            <div className="pln-prog-pct">{progress}%</div>
          </div>
        </div>

        <div className="pln-filters">
          {FILTER_LABELS.map((f) => (
            <div
              key={f}
              className={`pln-fchip ${filter === f ? 'active' : ''} fc-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              style={{ cursor: 'pointer' }}
            >
              {f}
            </div>
          ))}
        </div>

        <div className="pln-body">
          <div className="pln-sidebar">
            <div className="pln-cal-card">
              <div className="pln-cal-hdr">
                <div className="pln-cal-mo">{MONTH_NAMES[calMonth]} {calYear}</div>
                <div className="pln-cal-nav">
                  <div className="pln-cal-arr" onClick={prevMonth} style={{ cursor: 'pointer' }}>‹</div>
                  <div className="pln-cal-arr" onClick={nextMonth} style={{ cursor: 'pointer' }}>›</div>
                </div>
              </div>
              <div className="pln-cal-days-hdr">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="pln-cal-dh">{d}</div>)}
              </div>
              <div className="pln-cal-grid">
                {calCells.map((day, i) => {
                  const isToday = isCurrentMonth && day === todayDate
                  const cellDate = day ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                  const cellTasks = day ? tasks.filter((t) => t.date === cellDate) : []
                  const hasTasks = cellTasks.length > 0
                  const isSelected = !showAllDates && cellDate === selectedDate

                  return (
                    <div
                      key={i}
                      className={`pln-cal-cell ${!day ? 'pln-empty' : ''} ${isToday ? 'pln-today' : ''} ${hasTasks ? 'pln-has-tasks' : ''} ${isSelected ? 'pln-selected-day' : ''}`}
                      onClick={() => {
                        if (day) {
                          setSelectedDate(cellDate)
                          setShowAllDates(false)
                        }
                      }}
                    >
                      {day && <span>{day}</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pln-momentum">
              <div className="pln-mom-hd">Today&apos;s Momentum</div>
              <div className="pln-mom-inner">
                <div className="pln-mom-ring-wrap">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray="163.4" strokeDashoffset={163.4 - (163.4 * progress) / 100} transform="rotate(-90 32 32)" />
                  </svg>
                  <div className="pln-mom-pct">{progress}%</div>
                </div>
                <div className="pln-mom-stats">
                  <div className="pln-mom-stat-num">{done}</div>
                  <div className="pln-mom-stat-lbl">Completed</div>
                </div>
                <div className="pln-mom-divider" />
                <div className="pln-mom-stats">
                  <div className="pln-mom-stat-num">{tasks.length - done}</div>
                  <div className="pln-mom-stat-lbl">Remaining</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pln-main">
            {view === 'board' ? (
              <BoardView grouped={grouped} columns={COLUMNS} onToggle={toggleDone} onDelete={deleteTask} onMove={moveTask} onCyclePri={cyclePri} />
            ) : (
              <ListView filtered={filtered} columns={COLUMNS} onToggle={toggleDone} onDelete={deleteTask} onMove={moveTask} onCyclePri={cyclePri} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BoardView({ grouped, columns, onToggle, onDelete, onMove, onCyclePri }) {
  return (
    <div className="pln-board">
      {columns.map(([key, label, color]) => (
        <div className="pln-col" key={key}>
          <div className="pln-col-hdr">
            <div className="pln-col-title">
              <div className="pln-col-title-dot" style={{ background: color }} />
              {label}
            </div>
            <div className="pln-col-count">{grouped[key].length}</div>
          </div>
          <div className="pln-col-body">
            {grouped[key].length === 0 && (
              <div className="pln-col-empty">
                <div className="pln-col-empty-ico">○</div>
                <span>No tasks</span>
              </div>
            )}
            {grouped[key].map((task) => (
              <TaskCard key={task.id} task={task} columns={columns} currentCol={key} onToggle={onToggle} onDelete={onDelete} onMove={onMove} onCyclePri={onCyclePri} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task, columns, currentCol, onToggle, onDelete, onMove, onCyclePri }) {
  return (
    <div className={`pln-task-card pri-${task.pri} ${task.done ? 'pln-done' : ''}`}>
      <div className="pln-task-top">
        <button
          type="button"
          className={`pln-task-check ${task.done ? 'checked' : ''}`}
          onClick={() => onToggle(task.id)}
        >
          {task.done ? '✓' : ''}
        </button>
        <span className="pln-task-txt">{task.title}</span>
        <div className="pln-task-actions">
          <button type="button" className="pln-task-action-btn" onClick={() => onCyclePri(task.id)} title="Change priority">{task.pri[0].toUpperCase()}</button>
          <button type="button" className="pln-task-action-btn del" onClick={() => onDelete(task.id)} title="Delete">×</button>
        </div>
      </div>
      <div className="pln-task-meta">
        <span className={`pln-cat-badge cat-${task.cat}`}>{task.cat}</span>
        <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{task.pri}</span>
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={currentCol}
            onChange={(e) => onMove(task.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 8.5, color: 'var(--t3)', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', fontFamily: 'var(--mono)' }}
          >
            {columns.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
      </div>
      {task.date && (
        <div style={{ fontSize: 8.5, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span>📅</span> {task.date}
        </div>
      )}
    </div>
  )
}

function ListView({ filtered, columns, onToggle, onDelete, onMove, onCyclePri }) {
  return (
    <div className="pln-list-view">
      {columns.map(([key, label, color]) => {
        const colTasks = filtered.filter((t) => t.col === key)
        return (
          <div key={key} className="pln-list-section">
            <div className="pln-list-sec-hdr">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9, background: 'var(--beige2)', borderRadius: 8, padding: '1px 7px' }}>{colTasks.length}</span>
            </div>
            <div className="pln-list-tasks">
              {colTasks.map((task) => (
                <div key={task.id} className={`pln-list-task ${task.done ? 'pln-done' : ''}`}>
                  <div className={`pln-list-pri-bar`} style={{ background: task.pri === 'high' ? 'var(--maroon)' : task.pri === 'med' ? 'var(--navy)' : 'var(--beige3)' }} />
                  <button
                    type="button"
                    className={`pln-task-check ${task.done ? 'checked' : ''}`}
                    onClick={() => onToggle(task.id)}
                    style={{ flexShrink: 0 }}
                  >
                    {task.done ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span className="pln-task-txt">{task.title}</span>
                    {task.date && (
                      <span style={{ fontSize: 8, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 2 }}>📅 {task.date}</span>
                    )}
                  </div>
                  <div className="pln-list-task-right">
                    <span className={`pln-cat-badge cat-${task.cat}`}>{task.cat}</span>
                    <select
                      value={key}
                      onChange={(e) => onMove(task.id, e.target.value)}
                      style={{ fontSize: 10, color: 'var(--t3)', border: '1px solid var(--ln)', background: 'var(--beige2)', borderRadius: 5, padding: '2px 5px', cursor: 'pointer', outline: 'none' }}
                    >
                      {columns.map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                    </select>
                    <button type="button" className="pln-task-action-btn del" onClick={() => onDelete(task.id)}>×</button>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div style={{ padding: '8px 12px', color: 'var(--t3)', fontSize: 11, textAlign: 'center' }}>No tasks</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ value, label, tone }) {
  return (
    <div className="pln-stat-pill">
      <div>
        <div className={`pln-stat-pill-num ${tone}`}>{value}</div>
        <div className="pln-stat-pill-lbl">{label}</div>
      </div>
    </div>
  )
}

export default PlannerPage

