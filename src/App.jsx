import { useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'zentraq-workouts'
const PLANS_KEY = 'zentraq-workout-plans'

const PLAN_TEMPLATES = {
  'Push / Pull / Legs': [
    { name: 'Push', exercises: 'Bench Press\nOverhead Press\nIncline Dumbbell Press\nLateral Raises\nTriceps Pushdown' },
    { name: 'Pull', exercises: 'Lat Pulldown\nSeated Cable Row\nFace Pulls\nDumbbell Curls\nHammer Curls' },
    { name: 'Legs', exercises: 'Squats\nRomanian Deadlift\nLeg Press\nLeg Curl\nCalf Raises' },
  ],
  'Upper / Lower': [
    { name: 'Upper Body', exercises: 'Bench Press\nLat Pulldown\nShoulder Press\nSeated Row\nBicep Curls' },
    { name: 'Lower Body', exercises: 'Squats\nRomanian Deadlift\nLeg Press\nLeg Curl\nCalf Raises' },
  ],
  'Full Body': [
    { name: 'Full Body A', exercises: 'Squats\nBench Press\nSeated Row\nShoulder Press\nPlank' },
    { name: 'Full Body B', exercises: 'Deadlift\nIncline Dumbbell Press\nLat Pulldown\nLunges\nBicep Curls' },
  ],
}

const sampleWorkouts = [
  { id: 'sample-1', name: 'Upper Body Strength', detail: 'Chest, shoulders & arms', date: 'Today', duration: '55 min', volume: '4,250 kg', exercises: [], sample: true },
  { id: 'sample-2', name: 'Leg Day', detail: 'Quads, hamstrings & calves', date: 'Yesterday', duration: '48 min', volume: '6,800 kg', exercises: [], sample: true },
  { id: 'sample-3', name: 'Pull Day', detail: 'Back & biceps', date: 'Oct 26', duration: '52 min', volume: '3,950 kg', exercises: [], sample: true },
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

function getWeekDays() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  return DAY_NAMES.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)

    return {
      day,
      dateKey: localDateKey(date),
      isToday: localDateKey(date) === localDateKey(today),
    }
  })
}

function getWorkoutDateKey(workout) {
  if (workout.dateISO) return workout.dateISO
  if (!workout.date || workout.sample) return null

  const match = workout.date.match(/^(\d{1,2})\s+([A-Za-z]{3})$/)
  if (!match) return null

  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }

  const month = months[match[2]]
  if (month === undefined) return null

  const now = new Date()
  let year = now.getFullYear()

  if (new Date(year, month, Number(match[1])) > now && month === 11 && now.getMonth() === 0) {
    year -= 1
  }

  return localDateKey(new Date(year, month, Number(match[1])))
}

function emptyExercise() {
  return {
    id: crypto.randomUUID(),
    name: '',
    sets: '3',
    reps: '10',
    weight: '0',
  }
}

function loadWorkouts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleWorkouts
  } catch {
    return sampleWorkouts
  }
}

function loadPlans() {
  try {
    const saved = localStorage.getItem(PLANS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function calculateStreak(workouts) {
  const workoutDays = new Set(
    workouts.map(getWorkoutDateKey).filter(Boolean),
  )

  const today = new Date()
  const todayKey = localDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = localDateKey(yesterday)

  if (!workoutDays.has(todayKey) && !workoutDays.has(yesterdayKey)) {
    return 0
  }

  let streak = 0
  const currentDay = new Date(
    workoutDays.has(todayKey) ? today : yesterday,
  )

  while (workoutDays.has(localDateKey(currentDay))) {
    streak += 1
    currentDay.setDate(currentDay.getDate() - 1)
  }

  return streak
}

function App() {
  const [workouts, setWorkouts] = useState(loadWorkouts)
  const [showLogger, setShowLogger] = useState(false)
  const [editingWorkoutId, setEditingWorkoutId] = useState(null)
  const [workoutName, setWorkoutName] = useState('')
  const [duration, setDuration] = useState('45')
  const [exercises, setExercises] = useState([emptyExercise()])
  const [notice, setNotice] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [selectedExercise, setSelectedExercise] = useState('')

  const importInputRef = useRef(null)

  // Personalized workout plan state
  const [plans, setPlans] = useState(loadPlans)
  const [activePlanId, setActivePlanId] = useState(null)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [planName, setPlanName] = useState('')
  const [planTemplate, setPlanTemplate] = useState('Push / Pull / Legs')
  const [planDays, setPlanDays] = useState(
    PLAN_TEMPLATES['Push / Pull / Legs'].map(day => ({
      ...day,
      id: crypto.randomUUID(),
      completedDates: [],
    })),
  )

  const realWorkouts = workouts.filter(workout => !workout.sample)

  const totalMinutes = realWorkouts.reduce(
    (total, workout) => total + (Number.parseInt(workout.duration, 10) || 0),
    0,
  )

  const totalVolume = realWorkouts.reduce(
    (total, workout) =>
      total + (Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0),
    0,
  )

  const currentStreak = calculateStreak(realWorkouts)

  const weeklyActivity = getWeekDays().map(day => ({
    ...day,
    count: realWorkouts.filter(
      workout => getWorkoutDateKey(workout) === day.dateKey,
    ).length,
  }))

  const maxActivity = Math.max(
    1,
    ...weeklyActivity.map(day => day.count),
  )

  const volumeProgress = [...realWorkouts]
    .sort((a, b) =>
      (getWorkoutDateKey(a) || '').localeCompare(getWorkoutDateKey(b) || ''),
    )
    .slice(-7)
    .map(workout => ({
      id: workout.id,
      date: workout.date,
      volume: Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0,
    }))

  const maxVolumeProgress = Math.max(
    1,
    ...volumeProgress.map(workout => workout.volume),
  )

  const filteredWorkouts = [...workouts]
    .filter(workout => {
      const matchesSearch =
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workout.detail || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        historyFilter === 'all' ||
        (historyFilter === 'saved' && !workout.sample) ||
        (historyFilter === 'demo' && workout.sample)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name)

      if (sortOrder === 'duration') {
        return (
          (Number.parseInt(b.duration, 10) || 0) -
          (Number.parseInt(a.duration, 10) || 0)
        )
      }

      return (
        (getWorkoutDateKey(b) || '').localeCompare(getWorkoutDateKey(a) || '') ||
        (b.sample ? 1 : -1)
      )
    })

  // Exercise history data
  const exerciseNames = [...new Map(
    realWorkouts
      .flatMap(workout => (workout.exercises || []).filter(exercise => exercise.name?.trim()))
      .map(exercise => [exercise.name.trim().toLowerCase(), exercise.name.trim()]),
  ).values()].sort((a, b) => a.localeCompare(b))

  const activeExercise = exerciseNames.includes(selectedExercise)
    ? selectedExercise
    : exerciseNames[0] || ''

  const exerciseHistory = realWorkouts
    .flatMap(workout =>
      (workout.exercises || [])
        .filter(exercise => exercise.name?.trim().toLowerCase() === activeExercise.toLowerCase())
        .map(exercise => ({
          id: `${workout.id}-${exercise.id || exercise.name}`,
          workoutId: workout.id,
          workoutName: workout.name,
          date: workout.date,
          dateISO: getWorkoutDateKey(workout) || '',
          sets: Number(exercise.sets) || 0,
          reps: Number(exercise.reps) || 0,
          weight: Number(exercise.weight) || 0,
          volume: (Number(exercise.sets) || 0) * (Number(exercise.reps) || 0) * (Number(exercise.weight) || 0),
        })),
    )
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

  // Save workout plans
  function persistPlans(updated) {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(updated))
      setPlans(updated)
      return true
    } catch {
      setNotice('Could not save workout plans. Check browser storage.')
      return false
    }
  }

  function startPlanBuilder() {
    setPlanName('')
    setPlanTemplate('Push / Pull / Legs')
    setPlanDays(
      PLAN_TEMPLATES['Push / Pull / Legs'].map(day => ({
        ...day,
        id: crypto.randomUUID(),
        completedDates: [],
      })),
    )
    setShowPlanBuilder(true)
    setNotice('')
  }

  function changePlanTemplate(value) {
    setPlanTemplate(value)
    const templateDays = PLAN_TEMPLATES[value] || [
      { name: 'Day 1', exercises: '' },
    ]

    setPlanDays(
      templateDays.map(day => ({
        ...day,
        id: crypto.randomUUID(),
        completedDates: [],
      })),
    )
  }

  function updatePlanDay(id, field, value) {
    setPlanDays(current =>
      current.map(day =>
        day.id === id ? { ...day, [field]: value } : day,
      ),
    )
  }

  function addPlanDay() {
    setPlanDays(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: `Day ${current.length + 1}`,
        exercises: '',
        completedDates: [],
      },
    ])
  }

  function savePlan(event) {
    event.preventDefault()

    if (!planName.trim()) {
      setNotice('Enter a name for your workout plan.')
      return
    }

    const validDays = planDays.filter(day => day.name.trim())

    if (!validDays.length) {
      setNotice('Add at least one training day.')
      return
    }

    const plan = {
      id: crypto.randomUUID(),
      name: planName.trim(),
      split: planTemplate,
      createdAt: new Date().toISOString(),
      days: validDays.map(day => ({
        ...day,
        name: day.name.trim(),
        exercises: day.exercises
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean),
        completedDates: day.completedDates || [],
      })),
    }

    if (persistPlans([...plans, plan])) {
      setActivePlanId(plan.id)
      setShowPlanBuilder(false)
      setNotice('Workout plan created successfully.')
    }
  }

  function togglePlanDay(planId, dayId) {
    const today = localDateKey()

    const updated = plans.map(plan =>
      plan.id !== planId
        ? plan
        : {
            ...plan,
            days: plan.days.map(day => {
              if (day.id !== dayId) return day

              const dates = day.completedDates || []

              return {
                ...day,
                completedDates: dates.includes(today)
                  ? dates.filter(date => date !== today)
                  : [...dates, today],
              }
            }),
          },
    )

    persistPlans(updated)
  }

  function deletePlan(planId) {
    const plan = plans.find(item => item.id === planId)

    if (!plan || !window.confirm(`Delete the plan "${plan.name}"?`)) {
      return
    }

    const updated = plans.filter(item => item.id !== planId)

    if (persistPlans(updated) && activePlanId === planId) {
      setActivePlanId(updated[0]?.id || null)
    }
  }

  // Save workout records
  function persistWorkouts(updated) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setWorkouts(updated)
      return true
    } catch {
      setNotice('Could not save changes. Check your browser storage settings.')
      return false
    }
  }

  function exportBackup() {
    try {
      const backup = {
        app: 'ZENTRAQ FORGE',
        version: 1,
        exportedAt: new Date().toISOString(),
        workouts: realWorkouts,
      }

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: 'application/json' },
      )

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `zentraq-backup-${localDateKey()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setNotice(`Backup exported: ${realWorkouts.length} saved workouts.`)
    } catch {
      setNotice('Could not export your backup.')
    }
  }

  async function importBackup(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const imported = Array.isArray(parsed) ? parsed : parsed.workouts

      if (!Array.isArray(imported)) {
        throw new Error('Invalid backup format.')
      }

      const valid = imported.every(workout =>
        workout &&
        typeof workout.id === 'string' &&
        typeof workout.name === 'string' &&
        typeof workout.duration === 'string' &&
        typeof workout.volume === 'string' &&
        Array.isArray(workout.exercises),
      )

      if (!valid) {
        throw new Error('The file contains invalid workout records.')
      }

      const cleaned = imported.map(workout => ({
        ...workout,
        sample: false,
      }))

      const confirmed = window.confirm(
        `Import ${cleaned.length} workouts? This will replace your current saved workouts.`,
      )

      if (!confirmed) return

      if (persistWorkouts(cleaned)) {
        setNotice(`Successfully imported ${cleaned.length} workouts.`)
      }
    } catch (error) {
      setNotice(
        error instanceof SyntaxError
          ? 'This file is not valid JSON.'
          : error.message || 'Could not import this backup.',
      )
    }
  }

  function openLogger() {
    setEditingWorkoutId(null)
    setWorkoutName('')
    setDuration('45')
    setExercises([emptyExercise()])
    setNotice('')
    setShowLogger(true)
  }

  function openEditLogger(workout) {
    setEditingWorkoutId(workout.id)
    setWorkoutName(workout.name)
    setDuration(String(Number.parseInt(workout.duration, 10) || 45))
    setExercises(
      workout.exercises.length
        ? workout.exercises.map(exercise => ({
            id: exercise.id || crypto.randomUUID(),
            name: exercise.name || '',
            sets: String(exercise.sets ?? 3),
            reps: String(exercise.reps ?? 10),
            weight: String(exercise.weight ?? 0),
          }))
        : [emptyExercise()],
    )
    setNotice('')
    setShowLogger(true)
  }

  function updateExercise(id, field, value) {
    setExercises(current =>
      current.map(exercise =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise,
      ),
    )
  }

  function addExercise() {
    setExercises(current => [...current, emptyExercise()])
  }

  function removeExercise(id) {
    setExercises(current =>
      current.length > 1
        ? current.filter(exercise => exercise.id !== id)
        : current,
    )
  }

  function saveWorkout(event) {
    event.preventDefault()
    setNotice('')

    if (!workoutName.trim()) {
      setNotice('Enter a workout name first.')
      return
    }

    if (!duration || Number(duration) <= 0) {
      setNotice('Enter a valid workout duration.')
      return
    }

    const validExercises = exercises.filter(exercise => exercise.name.trim())

    if (!validExercises.length) {
      setNotice('Add at least one exercise with a name.')
      return
    }

    const existingWorkout = realWorkouts.find(
      workout => workout.id === editingWorkoutId,
    )

    const volume = validExercises.reduce((total, exercise) => {
      return total +
        (Number(exercise.sets) || 0) *
        (Number(exercise.reps) || 0) *
        (Number(exercise.weight) || 0)
    }, 0)

    const newWorkout = {
      id: existingWorkout?.id || crypto.randomUUID(),
      name: workoutName.trim(),
      detail: validExercises.map(exercise => exercise.name.trim()).join(', '),
      date: existingWorkout?.date || formatDate(),
      dateISO: existingWorkout?.dateISO || localDateKey(),
      duration: `${Number(duration)} min`,
      volume: `${volume.toLocaleString('en-US')} kg`,
      exercises: validExercises.map(exercise => ({
        ...exercise,
        name: exercise.name.trim(),
      })),
      sample: false,
    }

    const updated = editingWorkoutId
      ? realWorkouts.map(workout =>
          workout.id === editingWorkoutId ? newWorkout : workout,
        )
      : [newWorkout, ...realWorkouts]

    if (persistWorkouts(updated)) {
      setShowLogger(false)
      setEditingWorkoutId(null)
      setNotice('')
    }
  }

  function deleteWorkout(id) {
    const workout = realWorkouts.find(item => item.id === id)
    if (!workout) return

    if (!window.confirm(`Delete "${workout.name}"? This cannot be undone.`)) {
      return
    }

    const updated = realWorkouts.filter(item => item.id !== id)

    if (persistWorkouts(updated)) {
      setNotice('')
    }
  }

  function clearWorkouts() {
    if (!window.confirm('Clear all saved workouts? This cannot be undone.')) {
      return
    }

    if (persistWorkouts([])) {
      setNotice('')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>ZENTRAQ<span className="brand-light"> FORGE</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-nav">
          <a className="nav-item active" href="#overview">Overview</a>
          <a className="nav-item" href="#history">Workout history</a>
          <a className="nav-item" href="#progress">Progress</a>
          <a className="nav-item" href="#plans">Workout plans</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>LOCAL STORAGE ACTIVE</span>
          </div>
          <div className="sidebar-caption">YOUR TRAINING. YOUR DATA.</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">PERSONAL TRAINING DASHBOARD</div>
            <h1>Training overview</h1>
            <p className="page-subtitle">Track your work. Build consistency.</p>
          </div>

          <button className="primary-button" onClick={openLogger}>
            + Log workout
          </button>
        </header>

        <section className="stats-grid" id="overview">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total workouts</span>
              <span className="stat-icon">↗</span>
            </div>
            <div className="stat-number">{realWorkouts.length}</div>
            <div className="stat-foot">Saved training sessions</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Training time</span>
              <span className="stat-icon">◷</span>
            </div>
            <div className="stat-number">
              {Math.floor(totalMinutes / 60)}
              <span className="stat-unit">h </span>
              {totalMinutes % 60}
              <span className="stat-unit">m</span>
            </div>
            <div className="stat-foot">Total recorded duration</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total volume</span>
              <span className="stat-icon">▤</span>
            </div>
            <div className="stat-number">
              {totalVolume.toLocaleString('en-US')}
              <span className="stat-unit"> kg</span>
            </div>
            <div className="stat-foot">Sets × reps × weight</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Current streak</span>
              <span className="stat-icon">✳</span>
            </div>
            <div className="stat-number">
              {currentStreak}<span className="stat-unit"> days</span>
            </div>
            <div className="stat-foot">Consecutive training days</div>
          </article>
        </section>

        <section className="content-grid" id="progress">
          <article className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">CONSISTENCY</div>
                <h2>Weekly activity</h2>
              </div>
              <span className="panel-tag">THIS WEEK</span>
            </div>

            <div className="activity-chart">
              {weeklyActivity.map(day => (
                <div className="activity-column" key={day.dateKey}>
                  <span className="activity-count">{day.count || ''}</span>
                  <div className="activity-track">
                    <div
                      className={`activity-bar ${day.isToday ? 'today' : ''}`}
                      style={{
                        height: `${day.count ? Math.max(8, (day.count / maxActivity) * 100) : 3}%`,
                      }}
                    />
                  </div>
                  <span className={day.isToday ? 'day-label today-label' : 'day-label'}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="chart-caption">
              Activity is calculated from your saved workouts.
            </div>
          </article>

          <article className="panel volume-progress-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">PERFORMANCE</div>
                <h2>Volume progress</h2>
              </div>
              <span className="panel-tag">LAST 7</span>
            </div>

            {volumeProgress.length ? (
              <div className="volume-progress-chart">
                {volumeProgress.map(workout => (
                  <div className="volume-progress-column" key={workout.id}>
                    <strong>
                      {workout.volume >= 1000
                        ? `${(workout.volume / 1000).toFixed(1)}k`
                        : workout.volume}
                    </strong>
                    <div className="volume-progress-track">
                      <div
                        className="volume-progress-bar"
                        style={{
                          height: `${Math.max(4, (workout.volume / maxVolumeProgress) * 100)}%`,
                        }}
                      />
                    </div>
                    <span>{workout.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="progress-empty">
                Log workouts to see your volume progress.
              </div>
            )}
          </article>

          <article className="panel focus-panel">
            <div className="eyebrow">YOUR NEXT STEP</div>
            <h2>Consistency beats intensity.</h2>
            <p>
              Record every session to build a clearer picture of your training
              progress over time.
            </p>
            <button className="secondary-button" onClick={openLogger}>
              Record a session <span>↗</span>
            </button>
          </article>
        </section>

        {/* EXERCISE HISTORY */}
        <section className="panel exercise-history-panel" id="exercise-history">
          <div className="history-heading">
            <div>
              <div className="eyebrow">EXERCISE BREAKDOWN</div>
              <h2>Exercise history</h2>
              <p className="history-subtitle">
                Select an exercise to review every saved session where you performed it.
              </p>
            </div>

            {exerciseNames.length > 0 && (
              <label className="exercise-history-select-label">
                <span>EXERCISE</span>
                <select
                  value={activeExercise}
                  onChange={event => setSelectedExercise(event.target.value)}
                  aria-label="Select exercise history"
                >
                  {exerciseNames.map(name => (
                    <option value={name} key={name}>{name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {activeExercise ? (
            <>
              <div className="exercise-history-summary">
                <div>
                  <strong>{exerciseHistory.length}</strong>
                  <span>SESSIONS</span>
                </div>
                <div>
                  <strong>
                    {exerciseHistory.reduce((total, entry) => total + entry.volume, 0).toLocaleString('en-US')} kg
                  </strong>
                  <span>TOTAL VOLUME</span>
                </div>
              </div>

              <div className="exercise-history-list">
                {exerciseHistory.map(entry => (
                  <article className="exercise-history-row" key={entry.id}>
                    <div className="exercise-history-main">
                      <strong>{entry.workoutName}</strong>
                      <span>{entry.date}</span>
                    </div>
                    <div className="exercise-history-metric">
                      <strong>{entry.sets} × {entry.reps}</strong>
                      <span>SETS × REPS</span>
                    </div>
                    <div className="exercise-history-metric">
                      <strong>{entry.weight.toLocaleString('en-US')} kg</strong>
                      <span>WEIGHT</span>
                    </div>
                    <div className="exercise-history-metric">
                      <strong>{entry.volume.toLocaleString('en-US')} kg</strong>
                      <span>SESSION VOLUME</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="progress-empty">
              Log a workout with exercises to build your exercise history.
            </div>
          )}
        </section>

        {/* PERSONALIZED WORKOUT PLANS */}
        <section className="panel plans-panel" id="plans">
          <div className="history-heading">
            <div>
              <div className="eyebrow">STRUCTURED TRAINING</div>
              <h2>Personal workout plans</h2>
              <p className="history-subtitle">
                Build your split, assign exercises, and track completed sessions.
              </p>
            </div>
            <button className="primary-button" onClick={startPlanBuilder}>
              + Create plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="plans-empty">
              <h3>Your training plan starts here.</h3>
              <p>
                Create a Push/Pull/Legs, Upper/Lower, Full Body, or custom plan.
              </p>
              <button className="secondary-button" onClick={startPlanBuilder}>
                Build your first plan
              </button>
            </div>
          ) : (
            <>
              <div className="plan-tabs">
                {plans.map(plan => (
                  <button
                    key={plan.id}
                    className={
                      activePlanId === plan.id ||
                      (!activePlanId && plans[0].id === plan.id)
                        ? 'plan-tab active'
                        : 'plan-tab'
                    }
                    onClick={() => setActivePlanId(plan.id)}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>

              {(() => {
                const activePlan =
                  plans.find(plan => plan.id === activePlanId) || plans[0]

                if (!activePlan) return null

                const completedCount = activePlan.days.filter(day =>
                  (day.completedDates || []).includes(localDateKey()),
                ).length

                return (
                  <div className="active-plan">
                    <div className="active-plan-heading">
                      <div>
                        <span className="panel-tag">{activePlan.split}</span>
                        <h3>{activePlan.name}</h3>
                        <p>
                          {completedCount} of {activePlan.days.length} sessions completed today
                        </p>
                      </div>
                      <button
                        className="clear-button"
                        onClick={() => deletePlan(activePlan.id)}
                      >
                        Delete plan
                      </button>
                    </div>

                    <div className="plan-day-grid">
                      {activePlan.days.map((day, index) => {
                        const completed = (day.completedDates || []).includes(
                          localDateKey(),
                        )

                        return (
                          <article
                            className={
                              completed
                                ? 'plan-day-card completed'
                                : 'plan-day-card'
                            }
                            key={day.id}
                          >
                            <div className="plan-day-top">
                              <span>DAY {String(index + 1).padStart(2, '0')}</span>
                              {completed && (
                                <span className="plan-complete-label">
                                  COMPLETED
                                </span>
                              )}
                            </div>

                            <h4>{day.name}</h4>

                            <ul>
                              {day.exercises.map((exercise, exerciseIndex) => (
                                <li key={`${day.id}-${exerciseIndex}`}>
                                  {exercise}
                                </li>
                              ))}
                            </ul>

                            <button
                              className={
                                completed
                                  ? 'plan-complete-button done'
                                  : 'plan-complete-button'
                              }
                              onClick={() =>
                                togglePlanDay(activePlan.id, day.id)
                              }
                            >
                              {completed ? 'Undo completion' : 'Mark completed'}
                            </button>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </section>

        {/* WORKOUT HISTORY */}
        <section className="panel history-panel" id="history">
          <div className="history-heading">
            <div>
              <div className="eyebrow">YOUR TRAINING LOG</div>
              <h2>Workout history</h2>
              <p className="history-subtitle">
                Review, edit, remove, or back up your sessions.
              </p>
            </div>
            <button className="secondary-button" onClick={openLogger}>
              + Add workout
            </button>
          </div>

          <div className="history-controls">
            <input
              type="search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search workouts..."
              aria-label="Search workouts"
            />

            <select
              value={historyFilter}
              onChange={event => setHistoryFilter(event.target.value)}
              aria-label="Filter workouts"
            >
              <option value="all">All workouts</option>
              <option value="saved">Saved workouts</option>
              <option value="demo">Demo workouts</option>
            </select>

            <select
              value={sortOrder}
              onChange={event => setSortOrder(event.target.value)}
              aria-label="Sort workouts"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="duration">Longest duration</option>
            </select>
          </div>

          <div className="workout-list">
            {filteredWorkouts.length ? (
              filteredWorkouts.map(workout => (
                <article className="workout-row" key={workout.id}>
                  <div className="workout-symbol">↗</div>

                  <div className="workout-info">
                    <h3>{workout.name}</h3>
                    <p>{workout.detail || 'Workout session'}</p>
                    {workout.sample && (
                      <span className="demo-label">DEMO DATA</span>
                    )}
                  </div>

                  <div className="workout-date">{workout.date}</div>

                  <div className="workout-metric">
                    <strong>{workout.duration}</strong>
                    <span>DURATION</span>
                  </div>

                  <div className="workout-metric">
                    <strong>{workout.volume}</strong>
                    <span>VOLUME</span>
                  </div>

                  {!workout.sample && (
                    <div className="record-actions">
                      <button
                        className="record-edit"
                        type="button"
                        onClick={() => openEditLogger(workout)}
                      >
                        Edit
                      </button>
                      <button
                        className="record-delete"
                        type="button"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="empty-history">
                No workouts match your search.
              </div>
            )}
          </div>

          <div className="history-footer">
            <span>{filteredWorkouts.length} sessions displayed</span>

            <div className="backup-actions">
              <button className="secondary-button" onClick={exportBackup}>
                Export backup
              </button>

              <button
                className="secondary-button"
                onClick={() => importInputRef.current?.click()}
              >
                Import backup
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={importBackup}
              />

              {realWorkouts.length > 0 && (
                <button className="clear-button" onClick={clearWorkouts}>
                  Clear saved workouts
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div className="backup-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice('')}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}
        </section>

        <footer className="app-footer">
          <span>
            ZENTRAQ FORGE <span className="footer-separator">/</span> TRAIN WITH INTENTION
          </span>
          <span>PERSONAL WORKSPACE</span>
        </footer>
      </main>

      {/* CREATE WORKOUT PLAN MODAL */}
      {showPlanBuilder && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowPlanBuilder(false)
            }
          }}
        >
          <section
            className="workout-modal plan-builder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-builder-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">CUSTOM TRAINING SPLIT</div>
                <h2 id="plan-builder-title">Create workout plan</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowPlanBuilder(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={savePlan}>
              <label className="form-label">
                Plan name
                <input
                  value={planName}
                  onChange={event => setPlanName(event.target.value)}
                  placeholder="e.g. My 5-day strength plan"
                  required
                />
              </label>

              <label className="form-label">
                Starting template
                <select
                  value={planTemplate}
                  onChange={event => changePlanTemplate(event.target.value)}
                >
                  {Object.keys(PLAN_TEMPLATES).map(template => (
                    <option key={template} value={template}>
                      {template}
                    </option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </label>

              <div className="exercise-section-heading">
                <h3>Training days</h3>
                <button
                  type="button"
                  className="text-button"
                  onClick={addPlanDay}
                >
                  + Add day
                </button>
              </div>

              <div className="plan-builder-days">
                {planDays.map((day, index) => (
                  <div className="exercise-card" key={day.id}>
                    <div className="exercise-card-heading">
                      <span>DAY {String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <label className="form-label">
                      Day name
                      <input
                        value={day.name}
                        onChange={event =>
                          updatePlanDay(day.id, 'name', event.target.value)
                        }
                        placeholder="e.g. Chest & Triceps"
                        required
                      />
                    </label>

                    <label className="form-label">
                      Exercises (one per line)
                      <textarea
                        rows="4"
                        value={day.exercises}
                        onChange={event =>
                          updatePlanDay(day.id, 'exercises', event.target.value)
                        }
                        placeholder={'Bench Press\nIncline Dumbbell Press\nTriceps Pushdown'}
                      />
                    </label>
                  </div>
                ))}
              </div>

              {notice && <p className="form-notice">{notice}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowPlanBuilder(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save plan
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* WORKOUT LOGGER MODAL */}
      {showLogger && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowLogger(false)
              setEditingWorkoutId(null)
            }
          }}
        >
          <section
            className="workout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logger-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  {editingWorkoutId ? 'UPDATE SESSION' : 'NEW SESSION'}
                </div>
                <h2 id="logger-title">
                  {editingWorkoutId ? 'Edit workout' : 'Log a workout'}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowLogger(false)
                  setEditingWorkoutId(null)
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveWorkout}>
              <label className="form-label">
                Workout name
                <input
                  value={workoutName}
                  onChange={event => setWorkoutName(event.target.value)}
                  placeholder="e.g. Push Day"
                  required
                />
              </label>

              <label className="form-label">
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={event => setDuration(event.target.value)}
                  required
                />
              </label>

              <div className="exercise-section-heading">
                <h3>Exercises</h3>
                <button
                  type="button"
                  className="text-button"
                  onClick={addExercise}
                >
                  + Add exercise
                </button>
              </div>

              <div className="exercise-list">
                {exercises.map((exercise, index) => (
                  <div className="exercise-card" key={exercise.id}>
                    <div className="exercise-card-heading">
                      <span>EXERCISE {String(index + 1).padStart(2, '0')}</span>

                      {exercises.length > 1 && (
                        <button
                          type="button"
                          className="remove-exercise"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <label className="form-label">
                      Exercise name
                      <input
                        value={exercise.name}
                        onChange={event =>
                          updateExercise(exercise.id, 'name', event.target.value)
                        }
                        placeholder="e.g. Bench Press"
                      />
                    </label>

                    <div className="exercise-fields">
                      <label className="form-label">
                        Sets
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={event =>
                            updateExercise(exercise.id, 'sets', event.target.value)
                          }
                        />
                      </label>

                      <label className="form-label">
                        Reps
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={event =>
                            updateExercise(exercise.id, 'reps', event.target.value)
                          }
                        />
                      </label>

                      <label className="form-label">
                        Weight (kg)
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={event =>
                            updateExercise(exercise.id, 'weight', event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {notice && <p className="form-notice">{notice}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowLogger(false)
                    setEditingWorkoutId(null)
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingWorkoutId ? 'Save changes' : 'Save workout'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App