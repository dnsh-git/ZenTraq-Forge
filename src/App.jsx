
import { useState } from 'react'
import './App.css'

const STORAGE_KEY = 'zentraq-workouts'

const sampleWorkouts = [
  { id: 'sample-1', name: 'Upper Body Strength', detail: 'Chest, shoulders & arms', date: 'Today', duration: '55 min', volume: '4,250 kg', exercises: [], sample: true },
  { id: 'sample-2', name: 'Leg Day', detail: 'Quads, hamstrings & calves', date: 'Yesterday', duration: '48 min', volume: '6,800 kg', exercises: [], sample: true },
  { id: 'sample-3', name: 'Pull Day', detail: 'Back & biceps', date: 'Oct 26', duration: '52 min', volume: '3,950 kg', exercises: [], sample: true },
]

const weeklyActivity = [
  { day: 'Mon', height: 65 },
  { day: 'Tue', height: 85 },
  { day: 'Wed', height: 45 },
  { day: 'Thu', height: 100 },
  { day: 'Fri', height: 72 },
  { day: 'Sat', height: 90 },
  { day: 'Sun', height: 35 },
]

const emptyExercise = () => ({
  id: crypto.randomUUID(),
  name: '',
  sets: '3',
  reps: '10',
  weight: '0',
})

function loadWorkouts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleWorkouts
  } catch {
    return sampleWorkouts
  }
}

function App() {
  const [workouts, setWorkouts] = useState(loadWorkouts)
  const [showLogger, setShowLogger] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [duration, setDuration] = useState('45')
  const [exercises, setExercises] = useState([emptyExercise()])
  const [notice, setNotice] = useState('')

  const realWorkouts = workouts.filter((workout) => !workout.sample)

  const totalMinutes = realWorkouts.reduce(
    (total, workout) => total + (Number.parseInt(workout.duration, 10) || 0),
    0,
  )

  const totalVolume = realWorkouts.reduce(
    (total, workout) => total + (Number(workout.volume.replace(/[^0-9.]/g, '')) || 0),
    0,
  )

  function updateExercise(id, field, value) {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise,
      ),
    )
  }

  function openLogger() {
    setWorkoutName('')
    setDuration('45')
    setExercises([emptyExercise()])
    setNotice('')
    setShowLogger(true)
  }

  function saveWorkout(event) {
    event.preventDefault()

    const name = workoutName.trim()
    const minutes = Number(duration)

    if (!name || !Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
      setNotice('Enter a workout name and a valid duration.')
      return
    }

    const validExercises = exercises.map((exercise) => ({
      ...exercise,
      name: exercise.name.trim(),
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      weight: Number(exercise.weight),
    }))

    if (validExercises.some((exercise) =>
      !exercise.name ||
      !Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 100 ||
      !Number.isInteger(exercise.reps) || exercise.reps < 1 || exercise.reps > 1000 ||
      !Number.isFinite(exercise.weight) || exercise.weight < 0 || exercise.weight > 10000
    )) {
      setNotice('Check each exercise name, sets, reps and weight.')
      return
    }

    const volume = validExercises.reduce(
      (total, exercise) => total + exercise.sets * exercise.reps * exercise.weight,
      0,
    )

    const newWorkout = {
      id: crypto.randomUUID(),
      name,
      detail: `${validExercises.length} exercise${validExercises.length === 1 ? '' : 's'}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      duration: `${minutes} min`,
      volume: `${volume.toLocaleString('en-IN')} kg`,
      exercises: validExercises,
      sample: false,
    }

    const updated = [newWorkout, ...realWorkouts]

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setWorkouts(updated)
      setShowLogger(false)
    } catch {
      setNotice('Could not save. Check your browser storage settings.')
    }
  }

  function clearWorkouts() {
    if (!window.confirm('Delete all your saved workouts? This cannot be undone.')) return

    localStorage.removeItem(STORAGE_KEY)
    setWorkouts([])
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">Z</span>
          <span>ZENTRAQ<span className="brand-light">FORGE</span></span>
        </a>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          <a className="nav-item active" href="#dashboard"><span>▦</span> Dashboard</a>
          <a className="nav-item" href="#workouts"><span>◈</span> Workouts</a>
          <a className="nav-item" href="#progress"><span>↗</span> Progress</a>
          <a className="nav-item" href="#history"><span>◷</span> History</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-plan">
            <span className="plan-icon">✳</span>
            <div><strong>Stay consistent.</strong><p>Progress over perfection.</p></div>
          </div>
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info"><strong>Athlete</strong><span>Personal workspace</span></div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="topbar-right">
            <span className="today-label">YOUR TRAINING SPACE</span>
            <div className="avatar small">A</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow"><span className="status-dot" /> YOUR FITNESS OVERVIEW</p>
              <h1>Build strength.<br /><span>Track progress.</span></h1>
              <p className="welcome-copy">Every session counts. Here's how your training is going.</p>
            </div>
            <button className="primary-button" onClick={openLogger} type="button">
              <span>＋</span> Log a workout
            </button>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top"><span>Total workouts</span><span className="stat-icon">◈</span></div>
              <div className="stat-value">{realWorkouts.length} <span className="stat-unit">sessions</span></div>
              <div className="stat-foot"><span className="stat-accent">Your saved records</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Training time</span><span className="stat-icon">◷</span></div>
              <div className="stat-value">{(totalMinutes / 60).toFixed(1)} <span className="stat-unit">hours</span></div>
              <div className="stat-foot"><span className="stat-accent">Total logged time</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Total volume</span><span className="stat-icon">↗</span></div>
              <div className="stat-value">{totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume.toLocaleString('en-IN')} <span className="stat-unit">kg</span></div>
              <div className="stat-foot"><span className="stat-accent">Your logged volume</span></div>
            </article>
            <article className="stat-card highlight-stat">
              <div className="stat-top"><span>Current streak</span><span className="stat-icon">✳</span></div>
              <div className="stat-value">— <span className="stat-unit">days</span></div>
              <div className="stat-foot"><span>Streak tracking coming later</span></div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel activity-panel" id="progress">
              <div className="panel-heading">
                <div><p className="panel-kicker">YOUR CONSISTENCY</p><h2>Weekly activity</h2></div>
                <span className="period-badge">Preview</span>
              </div>
              <div className="chart-summary">
                <strong>{realWorkouts.length} <span>saved sessions</span></strong>
                <span className="chart-note">Illustrative activity</span>
              </div>
              <div className="activity-chart">
                {weeklyActivity.map((item) => (
                  <div className="chart-column" key={item.day}>
                    <div className="bar-area">
                      <div className={`activity-bar ${item.day === 'Thu' ? 'bar-featured' : ''}`} style={{ height: `${item.height}%` }} />
                    </div>
                    <span>{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="chart-footer"><span className="legend-dot" /> Sample chart data</div>
            </article>

            <article className="panel focus-panel">
              <div className="panel-heading">
                <div><p className="panel-kicker">NEXT UP</p><h2>Today's focus</h2></div>
                <span className="focus-symbol">✳</span>
              </div>
              <div className="focus-illustration"><span>01</span><span>02</span><span>03</span><span>04</span></div>
              <h3>Make it count.</h3>
              <p>Show up, focus on your form, and give your next session your best effort.</p>
              <a className="text-link" href="#workouts">View workout history <span>→</span></a>
            </article>
          </section>

          <section className="panel workouts-panel" id="workouts">
            <div className="panel-heading workout-heading">
              <div><p className="panel-kicker">YOUR TRAINING LOG</p><h2>Recent workouts</h2></div>
              <div className="workout-actions">
                <a href="#history" className="secondary-button">View history <span>→</span></a>
                {realWorkouts.length > 0 && (
                  <button className="clear-button" type="button" onClick={clearWorkouts}>Clear saved</button>
                )}
              </div>
            </div>

            {workouts.length === 0 ? (
              <div className="empty-state">
                <span>◈</span><strong>No workouts logged yet</strong>
                <p>Record your first session to start building your history.</p>
                <button className="secondary-button" onClick={openLogger} type="button}>Add your first workout</button>
              </div>
            ) : (
              <div className="workout-list" id="history">
                {workouts.map((workout, index) => (
                  <article className="workout-row" key={workout.id}>
                    <div className={`workout-symbol symbol-${(index % 3) + 1}`}>{['↗', '◈', '⌁'][index % 3]}</div>
                    <div className="workout-description">
                      <strong>{workout.name}</strong>
                      <span>{workout.detail}</span>
                      {workout.exercises?.length > 0 && (
                        <details className="exercise-details">
                          <summary>View {workout.exercises.length} exercises</summary>
                          {workout.exercises.map((exercise) => (
                            <p key={exercise.id}>
                              {exercise.name}: {exercise.sets} × {exercise.reps} × {exercise.weight} kg
                            </p>
                          ))}
                        </details>
                      )}
                    </div>
                    <div className="workout-date">{workout.date}</div>
                    <div className="workout-metric"><strong>{workout.duration}</strong><span>Duration</span></div>
                    <div className="workout-metric volume-metric"><strong>{workout.volume}</strong><span>Volume</span></div>
                    <span className="row-arrow">{workout.sample ? '•' : '✓'}</span>
                  </article>
                ))}
              </div>
            )}

            <p className="data-notice">
              {realWorkouts.length === 0
                ? 'Sample entries are shown until you save your first workout.'
                : 'Your workout records are saved in this browser.'}
            </p>
          </section>

          <footer className="page-footer">
            <span>ZENTRAQ FORGE <span className="footer-separator">/</span> TRAIN WITH INTENTION</span>
            <span>PERSONAL FITNESS WORKSPACE</span>
          </footer>
        </div>

        {showLogger && (
          <div className="modal-overlay" onClick={() => setShowLogger(false)}>
            <section
              className="logger-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logger-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-heading">
                <div><p className="panel-kicker">TRAINING LOG</p><h2 id="logger-title">Log a workout</h2></div>
                <button className="close-button" type="button" onClick={() => setShowLogger(false)} aria-label="Close">×</button>
              </div>

              <form onSubmit={saveWorkout}>
                <label htmlFor="workout-name">Workout name</label>
                <input id="workout-name" value={workoutName} onChange={(event) => setWorkoutName(event.target.value)} placeholder="e.g. Push Day" maxLength={60} required autoFocus />

                <label htmlFor="workout-duration">Duration (minutes)</label>
                <input id="workout-duration" type="number" min="1" max="1440" value={duration} onChange={(event) => setDuration(event.target.value)} required />

                <div className="exercise-form-heading">
                  <h3>Exercises</h3>
                  <span>{exercises.length} added</span>
                </div>

                {exercises.map((exercise, index) => (
                  <fieldset className="exercise-form-card" key={exercise.id}>
                    <div className="exercise-card-heading">
                      <legend>Exercise {index + 1}</legend>
                      {exercises.length > 1 && (
                        <button className="remove-exercise" type="button" onClick={() => setExercises((current) => current.filter((item) => item.id !== exercise.id))}>
                          Remove
                        </button>
                      )}
                    </div>

                    <label htmlFor={`exercise-name-${exercise.id}`}>Exercise name</label>
                    <input id={`exercise-name-${exercise.id}`} value={exercise.name} onChange={(event) => updateExercise(exercise.id, 'name', event.target.value)} placeholder="e.g. Bench Press" maxLength={60} required />

                    <div className="exercise-number-grid">
                      <div>
                        <label htmlFor={`sets-${exercise.id}`}>Sets</label>
                        <input id={`sets-${exercise.id}`} type="number" min="1" max="100" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, 'sets', event.target.value)} required />
                      </div>
                      <div>
                        <label htmlFor={`reps-${exercise.id}`}>Reps</label>
                        <input id={`reps-${exercise.id}`} type="number" min="1" max="1000" value={exercise.reps} onChange={(event) => updateExercise(exercise.id, 'reps', event.target.value)} required />
                      </div>
                      <div>
                        <label htmlFor={`weight-${exercise.id}`}>Weight (kg)</label>
                        <input id={`weight-${exercise.id}`} type="number" min="0" max="10000" step="0.5" value={exercise.weight} onChange={(event) => updateExercise(exercise.id, 'weight', event.target.value)} required />
                      </div>
                    </div>
                  </fieldset>
                ))}

                <button className="add-exercise-button" type="button" onClick={() => setExercises((current) => [...current, emptyExercise()])}>
                  ＋ Add another exercise
                </button>

                <p className="volume-preview">
                  Volume preview: {exercises.reduce((sum, exercise) => sum + (Number(exercise.sets) || 0) * (Number(exercise.reps) || 0) * (Number(exercise.weight) || 0), 0).toLocaleString('en-IN')} kg
                </p>

                {notice && <p className="form-notice" role="alert">{notice}</p>}
                <button className="primary-button save-workout" type="submit">Save workout</button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
