
import './App.css'

const weeklyActivity = [
  { day: 'Mon', height: 65 },
  { day: 'Tue', height: 85 },
  { day: 'Wed', height: 45 },
  { day: 'Thu', height: 100 },
  { day: 'Fri', height: 72 },
  { day: 'Sat', height: 90 },
  { day: 'Sun', height: 35 },
]

const workouts = [
  { name: 'Upper Body Strength', detail: 'Chest, shoulders & arms', date: 'Today', duration: '55 min', volume: '4,250 kg' },
  { name: 'Leg Day', detail: 'Quads, hamstrings & calves', date: 'Yesterday', duration: '48 min', volume: '6,800 kg' },
  { name: 'Pull Day', detail: 'Back & biceps', date: 'Oct 26', duration: '52 min', volume: '3,950 kg' },
]

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
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
            <div>
              <strong>Stay consistent.</strong>
              <p>Progress over perfection.</p>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <strong>Athlete</strong>
              <span>Personal workspace</span>
            </div>
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
            <a className="primary-button" href="#workouts"><span>＋</span> Log a workout</a>
          </section>

          <section className="stats-grid" aria-label="Workout statistics">
            <article className="stat-card">
              <div className="stat-top"><span>Total workouts</span><span className="stat-icon">◈</span></div>
              <div className="stat-value">12 <span className="stat-unit">sessions</span></div>
              <div className="stat-foot"><span className="stat-accent">This month</span><span>Sample data</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Training time</span><span className="stat-icon">◷</span></div>
              <div className="stat-value">9.4 <span className="stat-unit">hours</span></div>
              <div className="stat-foot"><span className="stat-accent">Time invested</span><span>Sample data</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Total volume</span><span className="stat-icon">↗</span></div>
              <div className="stat-value">48.2k <span className="stat-unit">kg</span></div>
              <div className="stat-foot"><span className="stat-accent">Weight lifted</span><span>Sample data</span></div>
            </article>
            <article className="stat-card highlight-stat">
              <div className="stat-top"><span>Current streak</span><span className="stat-icon">✳</span></div>
              <div className="stat-value">4 <span className="stat-unit">days</span></div>
              <div className="stat-foot"><span>Keep showing up.</span></div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel activity-panel" id="progress">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">YOUR CONSISTENCY</p>
                  <h2>Weekly activity</h2>
                </div>
                <span className="period-badge">Last 7 days</span>
              </div>
              <div className="chart-summary">
                <strong>5 <span>sessions</span></strong>
                <span className="chart-note">Your weekly overview</span>
              </div>
              <div className="activity-chart">
                {weeklyActivity.map((item) => (
                  <div className="chart-column" key={item.day}>
                    <div className="bar-area">
                      <div
                        className={`activity-bar ${item.day === 'Thu' ? 'bar-featured' : ''}`}
                        style={{ height: `${item.height}%` }}
                        title={`${item.day}: sample activity`}
                      />
                    </div>
                    <span>{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="chart-footer"><span className="legend-dot" /> Illustrative activity data</div>
            </article>

            <article className="panel focus-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">NEXT UP</p>
                  <h2>Today's focus</h2>
                </div>
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
              <div>
                <p className="panel-kicker">YOUR TRAINING LOG</p>
                <h2>Recent workouts</h2>
              </div>
              <a href="#history" className="secondary-button">View history <span>→</span></a>
            </div>
            <div className="workout-list">
              {workouts.map((workout, index) => (
                <article className="workout-row" key={workout.name}>
                  <div className={`workout-symbol symbol-${index + 1}`}>{['↗', '◈', '⌁'][index]}</div>
                  <div className="workout-description">
                    <strong>{workout.name}</strong>
                    <span>{workout.detail}</span>
                  </div>
                  <div className="workout-date">{workout.date}</div>
                  <div className="workout-metric"><strong>{workout.duration}</strong><span>Duration</span></div>
                  <div className="workout-metric volume-metric"><strong>{workout.volume}</strong><span>Volume</span></div>
                  <span className="row-arrow">↗</span>
                </article>
              ))}
            </div>
            <p className="data-notice">Preview only — workout entries and statistics are sample data, not saved records.</p>
          </section>

          <footer className="page-footer">
            <span>ZENTRAQ FORGE <span className="footer-separator">/</span> TRAIN WITH INTENTION</span>
            <span>PERSONAL FITNESS WORKSPACE</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
