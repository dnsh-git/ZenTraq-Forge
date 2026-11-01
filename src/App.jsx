import { useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'zentraq-workouts';
const PLANS_KEY = 'zentraq-workout-plans';
const PR_NOTIFICATIONS_KEY = 'zentraq-pr-notifications';
const GOALS_KEY = 'zentraq-goals';
const GOAL_NOTIFICATIONS_KEY = 'zentraq-goal-notifications';
const MUSCLE_OVERRIDES_KEY = 'zentraq-muscle-overrides';
const BODY_METRICS_KEY = 'zentraq-body-metrics';

const BODY_PARTS = [
  'Chest',
  'Waist',
  'Hips',
  'Shoulders',
  'Left arm',
  'Right arm',
  'Left forearm',
  'Right forearm',
  'Left thigh',
  'Right thigh',
  'Left calf',
  'Right calf',
  'Neck',
];

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Other',
];

const DEFAULT_MUSCLE_MAP = {
  bench: 'Chest',
  chest: 'Chest',
  fly: 'Chest',
  pushup: 'Chest',
  press: 'Shoulders',
  shoulder: 'Shoulders',
  lateral: 'Shoulders',
  raise: 'Shoulders',
  lat: 'Back',
  row: 'Back',
  pull: 'Back',
  deadlift: 'Back',
  face: 'Back',
  curl: 'Biceps',
  bicep: 'Biceps',
  tricep: 'Triceps',
  pushdown: 'Triceps',
  squat: 'Legs',
  leg: 'Legs',
  lunge: 'Legs',
  calf: 'Legs',
  hamstring: 'Legs',
  quad: 'Legs',
  plank: 'Core',
  ab: 'Core',
  core: 'Core',
  crunch: 'Core',
};

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
};

const sampleWorkouts = [
  { id: 'sample-1', name: 'Upper Body Strength', detail: 'Chest, shoulders & arms', date: 'Today', duration: '55 min', volume: '4,250 kg', exercises: [], sample: true },
  { id: 'sample-2', name: 'Leg Day', detail: 'Quads, hamstrings & calves', date: 'Yesterday', duration: '48 min', volume: '6,800 kg', exercises: [], sample: true },
  { id: 'sample-3', name: 'Pull Day', detail: 'Back & biceps', date: 'Oct 26', duration: '52 min', volume: '3,950 kg', exercises: [], sample: true },
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function getWeekDays() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return DAY_NAMES.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      day,
      dateKey: localDateKey(date),
      isToday: localDateKey(date) === localDateKey(today),
    };
  });
}

function getWorkoutDateKey(workout) {
  if (workout.dateISO) return workout.dateISO;
  if (!workout.date || workout.sample) return null;

  const match = workout.date.match(/^(\d{1,2})\s+([A-Za-z]{3})$/);
  if (!match) return null;

  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const month = months[match[2]];
  if (month === undefined) return null;

  const now = new Date();
  let year = now.getFullYear();

  if (
    new Date(year, month, Number(match[1])) > now &&
    month === 11 &&
    now.getMonth() === 0
  ) {
    year -= 1;
  }

  return localDateKey(new Date(year, month, Number(match[1])));
}

function emptyExercise() {
  return {
    id: crypto.randomUUID(),
    name: '',
    sets: '3',
    reps: '10',
    weight: '0',
  };
}

function loadWorkouts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : sampleWorkouts;
  } catch {
    return sampleWorkouts;
  }
}

function loadPlans() {
  try {
    const saved = localStorage.getItem(PLANS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadPRNotifications() {
  try {
    const saved = localStorage.getItem(PR_NOTIFICATIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredArray(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredObject(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function getWorkoutVolume(workout) {
  if (Array.isArray(workout.exercises) && workout.exercises.length) {
    return workout.exercises.reduce(
      (total, exercise) => total + getExerciseMetrics(exercise).volume,
      0
    );
  }

  return Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0;
}

function getWorkoutDuration(workout) {
  return Number.parseInt(workout.duration, 10) || 0;
}

function getDateKeyOffset(dateKey, offset) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}

function classifyExercise(name, overrides) {
  const key = name.trim().toLowerCase();
  if (overrides[key]) return overrides[key];

  const match = Object.keys(DEFAULT_MUSCLE_MAP).find(term => key.includes(term));
  return match ? DEFAULT_MUSCLE_MAP[match] : 'Other';
}

function getRangeStart(range, today = localDateKey()) {
  if (range === 'all') return null;
  return getDateKeyOffset(today, -(Number(range) - 1));
}

function getLongestStreak(workouts) {
  const dates = [...new Set(workouts.map(getWorkoutDateKey).filter(Boolean))].sort();
  let longest = 0;
  let current = 0;
  let previous = null;

  dates.forEach(date => {
    current = previous && getDateKeyOffset(previous, 1) === date
      ? current + 1
      : 1;
    longest = Math.max(longest, current);
    previous = date;
  });

  return longest;
}

function convertWeightToKg(value, unit) {
  return unit === 'lb' ? value * 0.45359237 : value;
}

function convertWeightFromKg(value, unit) {
  return unit === 'lb' ? value / 0.45359237 : value;
}

function convertLengthToCm(value, unit) {
  return unit === 'in' ? value * 2.54 : value;
}

function convertLengthFromCm(value, unit) {
  return unit === 'in' ? value / 2.54 : value;
}

function formatMetricValue(value, decimals = 1) {
  return Number(value.toFixed(decimals)).toLocaleString('en-US');
}

function getWeekStartKey(date = new Date()) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return localDateKey(start);
}

function calculateGoalProgress(goal, workouts) {
  const startDate = goal.startDate || '0000-00-00';
  const eligibleWorkouts = workouts.filter(workout => {
    const dateKey = getWorkoutDateKey(workout);
    return dateKey && dateKey >= startDate && dateKey <= (goal.targetDate || '9999-12-31');
  });

  if (goal.type === 'strength') {
    const weights = eligibleWorkouts.flatMap(workout =>
      (workout.exercises || [])
        .filter(exercise =>
          exercise.name?.trim().toLowerCase() === goal.exerciseName?.trim().toLowerCase()
        )
        .map(exercise => getExerciseMetrics(exercise).weight)
    );
    return {
      current: Math.max(0, ...weights),
      unit: 'kg',
    };
  }

  if (goal.type === 'frequency') {
    const weekStart = getWeekStartKey();
    const weekEnd = localDateKey(new Date(
      new Date(`${weekStart}T00:00:00`).getTime() + 6 * 86400000
    ));
    return {
      current: workouts.filter(workout => {
        const dateKey = getWorkoutDateKey(workout);
        return dateKey && dateKey >= weekStart && dateKey <= weekEnd;
      }).length,
      unit: 'workouts',
    };
  }

  if (goal.type === 'volume') {
    return {
      current: eligibleWorkouts.reduce(
        (total, workout) =>
          total + (Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0),
        0
      ),
      unit: 'kg',
    };
  }

  return {
    current: calculateStreak(eligibleWorkouts),
    unit: 'days',
  };
}

function getGoalStatus(goal, progress, today = localDateKey()) {
  if (goal.status === 'completed') return 'completed';
  if (goal.status === 'paused') return 'paused';
  if (progress >= 100) return 'completed';
  if (goal.targetDate && today > goal.targetDate) return 'expired';
  return 'active';
}

function formatGoalType(type) {
  return {
    strength: 'Strength goal',
    frequency: 'Workout frequency',
    volume: 'Training volume',
    consistency: 'Consistency',
  }[type] || 'Workout goal';
}

function getExerciseMetrics(exercise) {
  const sets = Number(exercise.sets) || 0;
  const reps = Number(exercise.reps) || 0;
  const weight = Number(exercise.weight) || 0;

  return {
    weight,
    reps,
    volume: sets * reps * weight,
  };
}

function getBestExerciseMetrics(workouts, exerciseName, excludedWorkoutId = null) {
  const sessions = workouts.flatMap(workout =>
    workout.id === excludedWorkoutId
      ? []
      : (workout.exercises || [])
        .filter(exercise =>
          exercise.name?.trim().toLowerCase() === exerciseName.toLowerCase()
        )
        .map(exercise => ({
          ...getExerciseMetrics(exercise),
          date: workout.date,
          workoutName: workout.name,
        }))
  );

  const best = metric =>
    sessions.reduce(
      (record, session) =>
        !record || session[metric] > record[metric] ? session : record,
      null
    );

  return {
    weight: best('weight'),
    reps: best('reps'),
    volume: best('volume'),
  };
}

function calculateStreak(workouts) {
  const workoutDays = new Set(workouts.map(getWorkoutDateKey).filter(Boolean));
  const today = new Date();
  const todayKey = localDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday);

  if (!workoutDays.has(todayKey) && !workoutDays.has(yesterdayKey)) {
    return 0;
  }

  let streak = 0;
  const currentDay = new Date(workoutDays.has(todayKey) ? today : yesterday);

  while (workoutDays.has(localDateKey(currentDay))) {
    streak += 1;
    currentDay.setDate(currentDay.getDate() - 1);
  }

  return streak;
}

function App() {
  const [workouts, setWorkouts] = useState(loadWorkouts);
  const [showLogger, setShowLogger] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('45');
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [notice, setNotice] = useState('');
  const [prNotifications, setPRNotifications] = useState(loadPRNotifications);
  const [activePRNotifications, setActivePRNotifications] = useState([]);
  const [goals, setGoals] = useState(() => loadStoredArray(GOALS_KEY));
  const [goalNotifications, setGoalNotifications] = useState(
    () => loadStoredArray(GOAL_NOTIFICATIONS_KEY)
  );
  const [activeGoalNotifications, setActiveGoalNotifications] = useState([]);
  const [showGoalBuilder, setShowGoalBuilder] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('strength');
  const [goalTargetValue, setGoalTargetValue] = useState('');
  const [goalExerciseName, setGoalExerciseName] = useState('');
  const [goalStartDate, setGoalStartDate] = useState(localDateKey());
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseChartMetric, setExerciseChartMetric] = useState('weight');
  const [insightRange, setInsightRange] = useState('30');
  const [insightVolumeView, setInsightVolumeView] = useState('weekly');
  const [muscleOverrides, setMuscleOverrides] = useState(
    () => loadStoredObject(MUSCLE_OVERRIDES_KEY)
  );
  const [bodyEntries, setBodyEntries] = useState(
    () => loadStoredArray(BODY_METRICS_KEY)
  );
  const [showBodyBuilder, setShowBodyBuilder] = useState(false);
  const [editingBodyEntryId, setEditingBodyEntryId] = useState(null);
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyWeightUnit, setBodyWeightUnit] = useState('kg');
  const [measurementUnit, setMeasurementUnit] = useState('cm');
  const [measurementDate, setMeasurementDate] = useState(localDateKey());
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [measurementValues, setMeasurementValues] = useState({});
  const [bodyRange, setBodyRange] = useState('all');
  const [selectedBodyPart, setSelectedBodyPart] = useState('Waist');
  const [bodySearch, setBodySearch] = useState('');
  const [bodySort, setBodySort] = useState('newest');
  const importInputRef = useRef(null);

  // Personalized workout plan state
  const [plans, setPlans] = useState(loadPlans);
  const [activePlanId, setActivePlanId] = useState(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planTemplate, setPlanTemplate] = useState('Push / Pull / Legs');
  const [planDays, setPlanDays] = useState(
    PLAN_TEMPLATES['Push / Pull / Legs'].map(day => ({
      ...day,
      id: crypto.randomUUID(),
      completedDates: [],
    }))
  );

  const realWorkouts = workouts.filter(workout => !workout.sample);

  const totalMinutes = realWorkouts.reduce(
    (total, workout) => total + (Number.parseInt(workout.duration, 10) || 0),
    0
  );

  const totalVolume = realWorkouts.reduce(
    (total, workout) =>
      total + (Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0),
    0
  );

  const exerciseNames = [...new Map(
    realWorkouts
      .flatMap(workout =>
        (workout.exercises || []).filter(exercise => exercise.name?.trim())
      )
      .map(exercise => [
        exercise.name.trim().toLowerCase(),
        exercise.name.trim(),
      ])
  ).values()].sort((a, b) => a.localeCompare(b));

  const currentStreak = calculateStreak(realWorkouts);

  const sortedBodyEntries = [...bodyEntries].sort((a, b) =>
    `${b.date}-${b.createdAt || ''}`.localeCompare(`${a.date}-${a.createdAt || ''}`)
  );
  const latestBodyEntry = sortedBodyEntries[0] || null;
  const firstBodyEntry = sortedBodyEntries[sortedBodyEntries.length - 1] || null;
  const bodyRangeStart = getRangeStart(bodyRange, localDateKey());
  const filteredBodyEntries = sortedBodyEntries.filter(entry =>
    !bodyRangeStart || entry.date >= bodyRangeStart
  );
  const bodyChartEntries = [...filteredBodyEntries]
    .filter(entry => entry.weightKg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const selectedBodyMeasurements = filteredBodyEntries
    .filter(entry => entry.measurementsCm?.[selectedBodyPart] > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const latestBodyValue = latestBodyEntry?.weightKg || 0;
  const startingBodyValue = firstBodyEntry?.weightKg || 0;
  const bodyWeightChange = latestBodyValue - startingBodyValue;
  const bodyRangeFirst = filteredBodyEntries[filteredBodyEntries.length - 1] || null;
  const bodyRangeLatest = filteredBodyEntries[0] || null;
  const bodyRangeWeightChange = bodyRangeLatest?.weightKg && bodyRangeFirst?.weightKg
    ? bodyRangeLatest.weightKg - bodyRangeFirst.weightKg
    : null;
  const bodyHistoryEntries = filteredBodyEntries.filter(entry => {
    const query = bodySearch.trim().toLowerCase();
    return !query ||
      (entry.notes || '').toLowerCase().includes(query) ||
      Object.keys(entry.measurementsCm || {}).some(part => part.toLowerCase().includes(query));
  }).sort((a, b) => bodySort === 'oldest'
    ? a.date.localeCompare(b.date)
    : b.date.localeCompare(a.date));

  const insightToday = localDateKey();
  const insightStart = getRangeStart(insightRange, insightToday);
  const insightWorkouts = realWorkouts.filter(workout => {
    const dateKey = getWorkoutDateKey(workout);
    return dateKey && (!insightStart || dateKey >= insightStart) && dateKey <= insightToday;
  });
  const insightDays = insightRange === 'all'
    ? Math.max(
        1,
        insightWorkouts.length
          ? Math.floor(
              (new Date(`${insightToday}T00:00:00`) -
                new Date(`${getWorkoutDateKey(insightWorkouts
                  .slice()
                  .sort((a, b) => getWorkoutDateKey(a).localeCompare(getWorkoutDateKey(b)))[0])}T00:00:00`)) /
                86400000
            ) + 1
          : 1
      )
    : Number(insightRange);
  const previousInsightStart = insightStart
    ? getDateKeyOffset(insightStart, -insightDays)
    : null;
  const previousInsightEnd = insightStart
    ? getDateKeyOffset(insightStart, -1)
    : null;
  const previousInsightWorkouts = previousInsightStart
    ? realWorkouts.filter(workout => {
        const dateKey = getWorkoutDateKey(workout);
        return dateKey && dateKey >= previousInsightStart && dateKey <= previousInsightEnd;
      })
    : [];
  const insightTotalVolume = insightWorkouts.reduce(
    (total, workout) => total + getWorkoutVolume(workout),
    0
  );
  const insightTotalDuration = insightWorkouts.reduce(
    (total, workout) => total + getWorkoutDuration(workout),
    0
  );
  const previousVolume = previousInsightWorkouts.reduce(
    (total, workout) => total + getWorkoutVolume(workout),
    0
  );
  const previousDuration = previousInsightWorkouts.reduce(
    (total, workout) => total + getWorkoutDuration(workout),
    0
  );
  const insightActiveDates = new Set(
    insightWorkouts.map(getWorkoutDateKey).filter(Boolean)
  );
  const insightActiveDayCount = insightActiveDates.size;
  const insightWeeks = Math.max(1, Math.ceil(insightDays / 7));
  const mostActiveDay = [...insightActiveDates].reduce(
    (best, dateKey) => {
      const day = new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
      best[day] = (best[day] || 0) + 1;
      return best;
    },
    {}
  );
  const mostActiveDayEntry = Object.entries(mostActiveDay)
    .sort((a, b) => b[1] - a[1])[0] || null;

  const insightVolumeEntries = (() => {
    const buckets = new Map();
    insightWorkouts.forEach(workout => {
      const dateKey = getWorkoutDateKey(workout);
      if (!dateKey) return;
      let bucketKey = dateKey;
      if (insightVolumeView === 'weekly') {
        bucketKey = getWeekStartKey(new Date(`${dateKey}T00:00:00`));
      } else if (insightVolumeView === 'monthly') {
        bucketKey = dateKey.slice(0, 7);
      }
      buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + getWorkoutVolume(workout));
    });
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, volume]) => ({ label, volume }));
  })();
  const maxInsightVolume = Math.max(
    1,
    ...insightVolumeEntries.map(entry => entry.volume)
  );
  const insightMuscleDistribution = MUSCLE_GROUPS.map(group => ({
    group,
    volume: insightWorkouts.reduce(
      (total, workout) =>
        total +
        (workout.exercises || [])
          .filter(exercise => classifyExercise(exercise.name || '', muscleOverrides) === group)
          .reduce((exerciseTotal, exercise) =>
            exerciseTotal + getExerciseMetrics(exercise).volume, 0),
      0
    ),
  }));
  const totalMuscleVolume = insightMuscleDistribution.reduce(
    (total, item) => total + item.volume,
    0
  );
  const exerciseInsightRows = exerciseNames.map(name => {
    const sessions = insightWorkouts.flatMap(workout =>
      (workout.exercises || [])
        .filter(exercise => exercise.name?.trim().toLowerCase() === name.toLowerCase())
        .map(exercise => ({
          dateISO: getWorkoutDateKey(workout) || '',
          weight: getExerciseMetrics(exercise).weight,
          volume: getExerciseMetrics(exercise).volume,
        }))
    ).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const first = sessions[0];
    const latest = sessions[sessions.length - 1];
    return {
      name,
      sessions: sessions.length,
      bestWeight: Math.max(0, ...sessions.map(session => session.weight)),
      bestVolume: Math.max(0, ...sessions.map(session => session.volume)),
      weightChange: first && latest ? latest.weight - first.weight : 0,
      volumeChange: first && latest ? latest.volume - first.volume : 0,
    };
  }).filter(row => row.sessions > 0);
  const mostFrequentExercises = [...exerciseInsightRows]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 3);
  const strongestProgression = [...exerciseInsightRows]
    .filter(row => row.sessions >= 2)
    .sort((a, b) => b.weightChange - a.weightChange)[0] || null;
  const decliningExercise = [...exerciseInsightRows]
    .filter(row => row.sessions >= 2 && row.weightChange < 0)
    .sort((a, b) => a.weightChange - b.weightChange)[0] || null;
  const insightVolumeChange = previousVolume
    ? ((insightTotalVolume - previousVolume) / previousVolume) * 100
    : null;
  const insightFrequencyChange = previousInsightWorkouts.length
    ? ((insightWorkouts.length - previousInsightWorkouts.length) /
      previousInsightWorkouts.length) * 100
    : null;
  const insightCards = [
    insightWorkouts.length
      ? `You completed ${insightWorkouts.length} workout${insightWorkouts.length === 1 ? '' : 's'} in this period.`
      : null,
    insightVolumeChange !== null && previousInsightWorkouts.length
      ? `Your training volume ${insightVolumeChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(insightVolumeChange).toFixed(0)}% compared with the previous period.`
      : null,
    strongestProgression
      ? `Your strongest exercise progression is in ${strongestProgression.name}.`
      : null,
    totalMuscleVolume > 0
      ? `${insightMuscleDistribution
          .slice()
          .sort((a, b) => b.volume - a.volume)[0].group} accounts for ${Math.round(
            (insightMuscleDistribution.slice().sort((a, b) => b.volume - a.volume)[0].volume /
              totalMuscleVolume) * 100
          )}% of recorded training volume.`
      : null,
    insightFrequencyChange !== null && insightFrequencyChange < -20
      ? `Training frequency decreased by ${Math.abs(insightFrequencyChange).toFixed(0)}% compared with the previous period.`
      : null,
  ].filter(Boolean);
  const heatmapDays = Array.from(
    { length: insightRange === 'all' ? 84 : Math.min(insightDays, 84) },
    (_, index) => {
      const dateKey = getDateKeyOffset(insightToday, -(
        (insightRange === 'all' ? 83 : Math.min(insightDays, 84) - 1) - index
      ));
      const count = insightWorkouts.filter(
        workout => getWorkoutDateKey(workout) === dateKey
      ).length;
      return { dateKey, count };
    }
  );
  const insightRestDays = Math.max(0, insightDays - insightActiveDayCount);
  const insightAverageWorkoutsPerWeek = insightWorkouts.length / insightWeeks;
  const insightConsistencyPercentage = (insightActiveDayCount / insightDays) * 100;

  const goalsWithProgress = goals.map(goal => {
    const progressData = calculateGoalProgress(goal, realWorkouts);
    const percentage = goal.targetValue > 0
      ? Math.min(100, (progressData.current / Number(goal.targetValue)) * 100)
      : 0;

    return {
      ...goal,
      ...progressData,
      percentage,
      displayStatus: getGoalStatus(goal, percentage),
    };
  });

  const weeklyActivity = getWeekDays().map(day => ({
    ...day,
    count: realWorkouts.filter(
      workout => getWorkoutDateKey(workout) === day.dateKey
    ).length,
  }));

  const maxActivity = Math.max(1, ...weeklyActivity.map(day => day.count));

  const volumeProgress = [...realWorkouts]
    .sort((a, b) =>
      (getWorkoutDateKey(a) || '').localeCompare(getWorkoutDateKey(b) || '')
    )
    .slice(-7)
    .map(workout => ({
      id: workout.id,
      date: workout.date,
      volume: Number(String(workout.volume || '').replace(/[^0-9.]/g, '')) || 0,
    }));

  const maxVolumeProgress = Math.max(
    1,
    ...volumeProgress.map(workout => workout.volume)
  );

  const filteredWorkouts = [...workouts]
    .filter(workout => {
      const matchesSearch =
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workout.detail || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        historyFilter === 'all' ||
        (historyFilter === 'saved' && !workout.sample) ||
        (historyFilter === 'demo' && workout.sample);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name);

      if (sortOrder === 'duration') {
        return (
          (Number.parseInt(b.duration, 10) || 0) -
          (Number.parseInt(a.duration, 10) || 0)
        );
      }

      return (
        (getWorkoutDateKey(b) || '').localeCompare(getWorkoutDateKey(a) || '') ||
        (b.sample ? 1 : -1)
      );
    });

  const activeExercise = exerciseNames.includes(selectedExercise)
    ? selectedExercise
    : exerciseNames[0] || '';

  const exerciseHistory = realWorkouts
    .flatMap(workout =>
      (workout.exercises || [])
        .filter(
          exercise =>
            exercise.name?.trim().toLowerCase() === activeExercise.toLowerCase()
        )
        .map(exercise => ({
          id: `${workout.id}-${exercise.id || exercise.name}`,
          workoutId: workout.id,
          workoutName: workout.name,
          date: workout.date,
          dateISO: getWorkoutDateKey(workout) || '',
          sets: Number(exercise.sets) || 0,
          reps: Number(exercise.reps) || 0,
          weight: Number(exercise.weight) || 0,
          volume:
            (Number(exercise.sets) || 0) *
            (Number(exercise.reps) || 0) *
            (Number(exercise.weight) || 0),
        }))
    )
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

  // Exercise progress chart data
  const chartMetricConfig = {
    weight: { label: 'Weight', unit: 'kg', value: entry => entry.weight },
    volume: { label: 'Volume', unit: 'kg', value: entry => entry.volume },
    reps: { label: 'Reps', unit: 'reps', value: entry => entry.reps },
  };

  const chartConfig = chartMetricConfig[exerciseChartMetric];
  const chartEntries = [...exerciseHistory].reverse();
  const chartValues = chartEntries.map(entry => chartConfig.value(entry));
  const chartMax = Math.max(...chartValues, 1);
  const chartMin = Math.min(...chartValues, 0);
  const chartRange = chartMax - chartMin || 1;
  const chartWidth = 640;
  const chartHeight = 190;
  const chartPadding = 24;

  const chartPoints = chartEntries.map((entry, index) => {
    const x = chartEntries.length === 1
      ? chartWidth / 2
      : chartPadding + (index / (chartEntries.length - 1)) * (chartWidth - chartPadding * 2);

    const y = chartHeight - chartPadding -
      ((chartConfig.value(entry) - chartMin) / chartRange) *
      (chartHeight - chartPadding * 2);

    return { x, y, entry, value: chartConfig.value(entry) };
  });

  const chartPolyline = chartPoints
    .map(point => `${point.x},${point.y}`)
    .join(' ');

  // Current vs previous session comparison
  const currentExerciseSession = exerciseHistory[0] || null;
  const previousExerciseSession = exerciseHistory[1] || null;

  const exerciseComparison =
    currentExerciseSession && previousExerciseSession
      ? [
          {
            label: 'Weight',
            unit: 'kg',
            current: currentExerciseSession.weight,
            previous: previousExerciseSession.weight,
          },
          {
            label: 'Volume',
            unit: 'kg',
            current: currentExerciseSession.volume,
            previous: previousExerciseSession.volume,
          },
          {
            label: 'Reps',
            unit: 'reps',
            current: currentExerciseSession.reps,
            previous: previousExerciseSession.reps,
          },
        ].map(metric => {
          const difference = metric.current - metric.previous;
          const percentage = metric.previous === 0
            ? null
            : (difference / metric.previous) * 100;

          return {
            ...metric,
            difference,
            percentage,
            status:
              difference > 0
                ? 'improved'
                : difference < 0
                  ? 'declined'
                  : 'unchanged',
          };
        })
      : [];

  // Personal records are calculated from saved workouts.
  // Editing or deleting a workout automatically recalculates the records.
  const personalRecords = exerciseNames.map(name => {
    const sessions = realWorkouts.flatMap(workout =>
      (workout.exercises || [])
        .filter(
          exercise =>
            exercise.name?.trim().toLowerCase() === name.toLowerCase()
        )
        .map(exercise => {
          const sets = Number(exercise.sets) || 0;
          const reps = Number(exercise.reps) || 0;
          const weight = Number(exercise.weight) || 0;

          return {
            workoutName: workout.name,
            date: workout.date,
            dateISO: getWorkoutDateKey(workout) || '',
            sets,
            reps,
            weight,
            volume: sets * reps * weight,
          };
        })
    );

    const latestFirst = [...sessions].sort(
      (a, b) => b.dateISO.localeCompare(a.dateISO)
    );

    const best = selector =>
      latestFirst.reduce(
        (record, session) =>
          !record || selector(session) > selector(record)
            ? session
            : record,
        null
      );

    return {
      name,
      sessions: sessions.length,
      heaviest: best(session => session.weight),
      mostReps: best(session => session.reps),
      highestVolume: best(session => session.volume),
    };
  }).filter(record => record.sessions > 0);

  // Save workout plans
  function persistPlans(updated) {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(updated));
      setPlans(updated);
      return true;
    } catch {
      setNotice('Could not save workout plans. Check browser storage.');
      return false;
    }
  }

  function startPlanBuilder() {
    setPlanName('');
    setPlanTemplate('Push / Pull / Legs');
    setPlanDays(
      PLAN_TEMPLATES['Push / Pull / Legs'].map(day => ({
        ...day,
        id: crypto.randomUUID(),
        completedDates: [],
      }))
    );
    setShowPlanBuilder(true);
    setNotice('');
  }

  function changePlanTemplate(value) {
    setPlanTemplate(value);
    const templateDays = PLAN_TEMPLATES[value] || [
      { name: 'Day 1', exercises: '' },
    ];

    setPlanDays(
      templateDays.map(day => ({
        ...day,
        id: crypto.randomUUID(),
        completedDates: [],
      }))
    );
  }

  function updatePlanDay(id, field, value) {
    setPlanDays(current =>
      current.map(day =>
        day.id === id ? { ...day, [field]: value } : day
      )
    );
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
    ]);
  }

  function savePlan(event) {
    event.preventDefault();

    if (!planName.trim()) {
      setNotice('Enter a name for your workout plan.');
      return;
    }

    const validDays = planDays.filter(day => day.name.trim());

    if (!validDays.length) {
      setNotice('Add at least one training day.');
      return;
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
    };

    if (persistPlans([...plans, plan])) {
      setActivePlanId(plan.id);
      setShowPlanBuilder(false);
      setNotice('Workout plan created successfully.');
    }
  }

  function togglePlanDay(planId, dayId) {
    const today = localDateKey();

    const updated = plans.map(plan =>
      plan.id !== planId
        ? plan
        : {
            ...plan,
            days: plan.days.map(day => {
              if (day.id !== dayId) return day;

              const dates = day.completedDates || [];

              return {
                ...day,
                completedDates: dates.includes(today)
                  ? dates.filter(date => date !== today)
                  : [...dates, today],
              };
            }),
          }
    );

    persistPlans(updated);
  }

  function deletePlan(planId) {
    const plan = plans.find(item => item.id === planId);

    if (!plan || !window.confirm(`Delete the plan "${plan.name}"?`)) {
      return;
    }

    const updated = plans.filter(item => item.id !== planId);

    if (persistPlans(updated) && activePlanId === planId) {
      setActivePlanId(updated[0]?.id || null);
    }
  }

  // Save workout records
  function syncGoalProgress(workoutList, goalList = goals) {
    if (!goalList.length) return;

    const today = localDateKey();
    const notifications = [];
    let goalsChanged = false;
    const updatedGoals = goalList.map(goal => {
      const progressData = calculateGoalProgress(goal, workoutList);
      const percentage = goal.targetValue > 0
        ? Math.min(100, (progressData.current / Number(goal.targetValue)) * 100)
        : 0;
      const previousMilestones = Array.isArray(goal.notifiedMilestones)
        ? goal.notifiedMilestones
        : [];
      const nextMilestones = [...previousMilestones];
      let nextStatus = getGoalStatus(goal, percentage, today);
      let completionDate = goal.completionDate || null;

      if (goal.status === 'active') {
        [25, 50, 75, 100].forEach(milestone => {
          if (percentage >= milestone && !nextMilestones.includes(milestone)) {
            nextMilestones.push(milestone);
            notifications.push({
              id: crypto.randomUUID(),
              goalId: goal.id,
              title: goal.title,
              milestone,
              current: progressData.current,
              target: Number(goal.targetValue),
              unit: progressData.unit,
              date: today,
            });
          }
        });
      }

      if (nextStatus === 'completed' && goal.status !== 'completed') {
        completionDate = today;
      }

      const nextGoal = {
        ...goal,
        status: nextStatus,
        completionDate,
        notifiedMilestones: nextMilestones,
      };

      if (JSON.stringify(nextGoal) !== JSON.stringify(goal)) {
        goalsChanged = true;
      }
      return nextGoal;
    });

    if (goalsChanged) {
      setGoals(updatedGoals);
      try {
        localStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
      } catch {
        setNotice('Could not update goals. Check your browser storage settings.');
      }
    }

    if (notifications.length) {
      const updatedNotifications = [...notifications, ...goalNotifications];
      setGoalNotifications(updatedNotifications);
      setActiveGoalNotifications(notifications);
      try {
        localStorage.setItem(
          GOAL_NOTIFICATIONS_KEY,
          JSON.stringify(updatedNotifications)
        );
      } catch {
        setNotice('Could not save goal milestones. Check browser storage.');
      }
    }
  }

  function persistWorkouts(updated) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setWorkouts(updated);
      syncGoalProgress(updated);
      return true;
    } catch {
      setNotice('Could not save changes. Check your browser storage settings.');
      return false;
    }
  }

  function persistPRNotifications(updated) {
    try {
      localStorage.setItem(PR_NOTIFICATIONS_KEY, JSON.stringify(updated));
      setPRNotifications(updated);
      return true;
    } catch {
      setNotice('Could not save PR notifications. Check browser storage.');
      return false;
    }
  }

  function updateMuscleClassification(exerciseName, group) {
    const updated = {
      ...muscleOverrides,
      [exerciseName.trim().toLowerCase()]: group,
    };
    setMuscleOverrides(updated);
    try {
      localStorage.setItem(MUSCLE_OVERRIDES_KEY, JSON.stringify(updated));
    } catch {
      setNotice('Could not save muscle classification. Check browser storage.');
    }
  }

  function persistBodyEntries(updated) {
    try {
      localStorage.setItem(BODY_METRICS_KEY, JSON.stringify(updated));
      setBodyEntries(updated);
      return true;
    } catch {
      setNotice('Could not save body metrics. Check your browser storage settings.');
      return false;
    }
  }

  function openBodyBuilder() {
    setEditingBodyEntryId(null);
    setBodyWeight('');
    setBodyWeightUnit('kg');
    setMeasurementUnit('cm');
    setMeasurementDate(localDateKey());
    setMeasurementNotes('');
    setMeasurementValues({});
    setNotice('');
    setShowBodyBuilder(true);
  }

  function openBodyEditor(entry) {
    setEditingBodyEntryId(entry.id);
    setBodyWeight(
      entry.weightKg
        ? String(Number(convertWeightFromKg(entry.weightKg, entry.weightUnit || 'kg').toFixed(2)))
        : ''
    );
    setBodyWeightUnit(entry.weightUnit || 'kg');
    setMeasurementUnit(entry.measurementUnit || 'cm');
    setMeasurementDate(entry.date);
    setMeasurementNotes(entry.notes || '');
    setMeasurementValues(
      Object.fromEntries(
        Object.entries(entry.measurementsCm || {}).map(([part, value]) => [
          part,
          String(Number(convertLengthFromCm(value, entry.measurementUnit || 'cm').toFixed(2))),
        ])
      )
    );
    setNotice('');
    setShowBodyBuilder(true);
  }

  function updateMeasurementValue(part, value) {
    setMeasurementValues(current => ({ ...current, [part]: value }));
  }

  function saveBodyEntry(event) {
    event.preventDefault();
    const weight = bodyWeight === '' ? null : Number(bodyWeight);
    const measurements = Object.fromEntries(
      Object.entries(measurementValues)
        .filter(([, value]) => value !== '' && Number(value) > 0)
        .map(([part, value]) => [
          part,
          convertLengthToCm(Number(value), measurementUnit),
        ])
    );

    if (weight !== null && (!Number.isFinite(weight) || weight <= 0)) {
      setNotice('Body weight must be greater than zero.');
      return;
    }

    if (Object.values(measurementValues).some(
      value => value !== '' && (!Number.isFinite(Number(value)) || Number(value) <= 0)
    )) {
      setNotice('Measurements must be greater than zero.');
      return;
    }

    if (weight === null && !Object.keys(measurements).length) {
      setNotice('Add a body weight or at least one measurement.');
      return;
    }

    const existing = bodyEntries.find(entry => entry.id === editingBodyEntryId);
    const entry = {
      id: existing?.id || crypto.randomUUID(),
      date: measurementDate,
      weightKg: weight === null ? null : convertWeightToKg(weight, bodyWeightUnit),
      weightUnit: bodyWeightUnit,
      measurementsCm: measurements,
      measurementUnit,
      notes: measurementNotes.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    const updated = editingBodyEntryId
      ? bodyEntries.map(item => item.id === editingBodyEntryId ? entry : item)
      : [entry, ...bodyEntries];

    if (persistBodyEntries(updated)) {
      setShowBodyBuilder(false);
      setEditingBodyEntryId(null);
      setNotice('');
    }
  }

  function deleteBodyEntry(id) {
    const entry = bodyEntries.find(item => item.id === id);
    if (!entry || !window.confirm(`Delete the body metrics from ${entry.date}?`)) return;
    persistBodyEntries(bodyEntries.filter(item => item.id !== id));
  }

  function dismissPRNotification(id) {
    setActivePRNotifications(current =>
      current.filter(notification => notification.id !== id)
    );
  }

  function dismissPRHistoryItem(id) {
    persistPRNotifications(
      prNotifications.filter(notification => notification.id !== id)
    );
  }

  function persistGoals(updated) {
    try {
      localStorage.setItem(GOALS_KEY, JSON.stringify(updated));
      setGoals(updated);
      syncGoalProgress(realWorkouts, updated);
      return true;
    } catch {
      setNotice('Could not save goals. Check your browser storage settings.');
      return false;
    }
  }

  function openGoalBuilder() {
    setEditingGoalId(null);
    setGoalTitle('');
    setGoalType('strength');
    setGoalTargetValue('');
    setGoalExerciseName(exerciseNames[0] || '');
    setGoalStartDate(localDateKey());
    setGoalTargetDate('');
    setNotice('');
    setShowGoalBuilder(true);
  }

  function openGoalEditor(goal) {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setGoalType(goal.type);
    setGoalTargetValue(String(goal.targetValue));
    setGoalExerciseName(goal.exerciseName || '');
    setGoalStartDate(goal.startDate || localDateKey());
    setGoalTargetDate(goal.targetDate || '');
    setNotice('');
    setShowGoalBuilder(true);
  }

  function saveGoal(event) {
    event.preventDefault();

    if (!goalTitle.trim()) {
      setNotice('Enter a title for this goal.');
      return;
    }

    if (!goalTargetValue || Number(goalTargetValue) <= 0) {
      setNotice('Enter a target greater than zero.');
      return;
    }

    if (goalType === 'strength' && !goalExerciseName) {
      setNotice('Select an exercise for your strength goal.');
      return;
    }

    if (!goalTargetDate || goalTargetDate < goalStartDate) {
      setNotice('Choose a target date on or after the start date.');
      return;
    }

    const existingGoal = goals.find(goal => goal.id === editingGoalId);
    const goal = {
      id: existingGoal?.id || crypto.randomUUID(),
      title: goalTitle.trim(),
      type: goalType,
      targetValue: Number(goalTargetValue),
      exerciseName: goalType === 'strength' ? goalExerciseName : '',
      startDate: goalStartDate,
      targetDate: goalTargetDate,
      status: existingGoal?.status === 'paused' ? 'paused' : 'active',
      completionDate: null,
      notifiedMilestones: existingGoal?.notifiedMilestones || [],
      createdAt: existingGoal?.createdAt || new Date().toISOString(),
    };
    const updated = editingGoalId
      ? goals.map(item => item.id === editingGoalId ? goal : item)
      : [goal, ...goals];

    if (persistGoals(updated)) {
      setShowGoalBuilder(false);
      setEditingGoalId(null);
      setNotice('');
    }
  }

  function deleteGoal(id) {
    const goal = goals.find(item => item.id === id);
    if (!goal || !window.confirm(`Delete the goal "${goal.title}"?`)) return;

    persistGoals(goals.filter(item => item.id !== id));
  }

  function toggleGoalPause(goal) {
    const isPaused = goal.status === 'paused';
    const progress = calculateGoalProgress(goal, realWorkouts);
    const percentage = goal.targetValue > 0
      ? Math.min(100, (progress.current / Number(goal.targetValue)) * 100)
      : 0;
    const milestones = Array.isArray(goal.notifiedMilestones)
      ? goal.notifiedMilestones
      : [];
    const updatedGoal = {
      ...goal,
      status: isPaused ? 'active' : 'paused',
      notifiedMilestones: isPaused
        ? milestones
        : [...new Set([
            ...milestones,
            ...[25, 50, 75, 100].filter(milestone => percentage >= milestone),
          ])],
    };

    persistGoals(
      goals.map(item => item.id === goal.id ? updatedGoal : item)
    );
  }

  function dismissGoalNotification(id) {
    setActiveGoalNotifications(current =>
      current.filter(notification => notification.id !== id)
    );
  }

  function dismissGoalHistoryItem(id) {
    const updated = goalNotifications.filter(notification => notification.id !== id);
    setGoalNotifications(updated);
    try {
      localStorage.setItem(GOAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch {
      setNotice('Could not update goal milestones. Check browser storage.');
    }
  }

  function exportBackup() {
    try {
      const backup = {
        app: 'ZENTRAQ FORGE',
        version: 2,
        exportedAt: new Date().toISOString(),
        workouts: realWorkouts,
        goals,
        goalNotifications,
        muscleOverrides,
        bodyEntries,
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zentraq-backup-${localDateKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setNotice(`Backup exported: ${realWorkouts.length} saved workouts.`);
    } catch {
      setNotice('Could not export your backup.');
    }
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = Array.isArray(parsed) ? parsed : parsed.workouts;
      const importedGoals = Array.isArray(parsed) ? null : parsed.goals;
      const importedGoalNotifications = Array.isArray(parsed)
        ? null
        : parsed.goalNotifications;
      const importedMuscleOverrides = Array.isArray(parsed)
        ? null
        : parsed.muscleOverrides;
      const importedBodyEntries = Array.isArray(parsed) ? null : parsed.bodyEntries;

      if (!Array.isArray(imported)) {
        throw new Error('Invalid backup format.');
      }

      const valid = imported.every(workout =>
        workout &&
        typeof workout.id === 'string' &&
        typeof workout.name === 'string' &&
        typeof workout.duration === 'string' &&
        typeof workout.volume === 'string' &&
        Array.isArray(workout.exercises)
      );

      if (!valid) {
        throw new Error('The file contains invalid workout records.');
      }

      const cleaned = imported.map(workout => ({
        ...workout,
        sample: false,
      }));

      const confirmed = window.confirm(
        `Import ${cleaned.length} workouts${Array.isArray(importedGoals) ? ` and ${importedGoals.length} goals` : ''}? This will replace your current saved workouts${Array.isArray(importedGoals) ? ' and goals' : ''}.`
      );

      if (!confirmed) return;

      if (persistWorkouts(cleaned)) {
        if (Array.isArray(importedGoals)) {
          persistGoals(importedGoals);
        }
        if (Array.isArray(importedGoalNotifications)) {
          setGoalNotifications(importedGoalNotifications);
          localStorage.setItem(
            GOAL_NOTIFICATIONS_KEY,
            JSON.stringify(importedGoalNotifications)
          );
        }
        if (importedMuscleOverrides && typeof importedMuscleOverrides === 'object') {
          setMuscleOverrides(importedMuscleOverrides);
          localStorage.setItem(
            MUSCLE_OVERRIDES_KEY,
            JSON.stringify(importedMuscleOverrides)
          );
        }
        if (Array.isArray(importedBodyEntries)) {
          persistBodyEntries(importedBodyEntries);
        }
        setNotice(`Successfully imported ${cleaned.length} workouts.`);
      }
    } catch (error) {
      setNotice(
        error instanceof SyntaxError
          ? 'This file is not valid JSON.'
          : error.message || 'Could not import this backup.'
      );
    }
  }

  function openLogger() {
    setEditingWorkoutId(null);
    setWorkoutName('');
    setDuration('45');
    setExercises([emptyExercise()]);
    setNotice('');
    setShowLogger(true);
  }

  function openEditLogger(workout) {
    setEditingWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setDuration(String(Number.parseInt(workout.duration, 10) || 45));
    setExercises(
      workout.exercises.length
        ? workout.exercises.map(exercise => ({
            id: exercise.id || crypto.randomUUID(),
            name: exercise.name || '',
            sets: String(exercise.sets ?? 3),
            reps: String(exercise.reps ?? 10),
            weight: String(exercise.weight ?? 0),
          }))
        : [emptyExercise()]
    );
    setNotice('');
    setShowLogger(true);
  }

  function updateExercise(id, field, value) {
    setExercises(current =>
      current.map(exercise =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  function addExercise() {
    setExercises(current => [...current, emptyExercise()]);
  }

  function removeExercise(id) {
    setExercises(current =>
      current.length > 1
        ? current.filter(exercise => exercise.id !== id)
        : current
    );
  }

  function saveWorkout(event) {
    event.preventDefault();
    setNotice('');

    if (!workoutName.trim()) {
      setNotice('Enter a workout name first.');
      return;
    }

    if (!duration || Number(duration) <= 0) {
      setNotice('Enter a valid workout duration.');
      return;
    }

    const validExercises = exercises.filter(exercise => exercise.name.trim());

    if (!validExercises.length) {
      setNotice('Add at least one exercise with a name.');
      return;
    }

    const existingWorkout = realWorkouts.find(
      workout => workout.id === editingWorkoutId
    );
    const previousWorkouts = realWorkouts.filter(
      workout => workout.id !== existingWorkout?.id
    );

    const volume = validExercises.reduce((total, exercise) => {
      return total +
        (Number(exercise.sets) || 0) *
        (Number(exercise.reps) || 0) *
        (Number(exercise.weight) || 0);
    }, 0);

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
    };

    const newPRs = [];
    const seenExercises = new Set();

    validExercises.forEach(exercise => {
      const exerciseName = exercise.name.trim();
      const exerciseKey = exerciseName.toLowerCase();

      if (seenExercises.has(exerciseKey)) return;
      seenExercises.add(exerciseKey);

      const metrics = validExercises
        .filter(item => item.name.trim().toLowerCase() === exerciseKey)
        .map(getExerciseMetrics);
      const current = {
        weight: Math.max(...metrics.map(metric => metric.weight)),
        reps: Math.max(...metrics.map(metric => metric.reps)),
        volume: Math.max(...metrics.map(metric => metric.volume)),
      };
      const previous = getBestExerciseMetrics(
        previousWorkouts,
        exerciseKey
      );
      const oldMetrics = existingWorkout
        ? existingWorkout.exercises
          .filter(item => item.name?.trim().toLowerCase() === exerciseKey)
          .map(getExerciseMetrics)
        : [];
      const oldValue = metric =>
        oldMetrics.length
          ? Math.max(...oldMetrics.map(item => item[metric]))
          : null;
      const recordTypes = [
        { key: 'weight', label: 'Heaviest weight', unit: 'kg' },
        { key: 'reps', label: 'Most reps', unit: 'reps' },
        { key: 'volume', label: 'Highest volume', unit: 'kg' },
      ];

      recordTypes.forEach(recordType => {
        const newValue = current[recordType.key];
        const previousValue = previous[recordType.key]?.[recordType.key] ?? null;

        const isNewRecord =
          (previousValue === null || newValue > previousValue) &&
          (!existingWorkout ||
            oldValue(recordType.key) === null ||
            newValue > oldValue(recordType.key));

        if (isNewRecord) {
          newPRs.push({
            id: crypto.randomUUID(),
            exerciseName,
            category: recordType.label,
            metric: recordType.key,
            previousValue,
            value: newValue,
            unit: recordType.unit,
            date: newWorkout.date,
            dateISO: newWorkout.dateISO,
            workoutName: newWorkout.name,
          });
        }
      });
    });

    const updated = editingWorkoutId
      ? realWorkouts.map(workout =>
          workout.id === editingWorkoutId ? newWorkout : workout
        )
      : [newWorkout, ...realWorkouts];

    if (persistWorkouts(updated)) {
      if (newPRs.length) {
        persistPRNotifications([...newPRs, ...prNotifications]);
        setActivePRNotifications(newPRs);
      }
      setShowLogger(false);
      setEditingWorkoutId(null);
      setNotice('');
    }
  }

  function deleteWorkout(id) {
    const workout = realWorkouts.find(item => item.id === id);
    if (!workout) return;

    if (!window.confirm(`Delete "${workout.name}"? This cannot be undone.`)) {
      return;
    }

    const updated = realWorkouts.filter(item => item.id !== id);

    if (persistWorkouts(updated)) {
      setNotice('');
    }
  }

  function clearWorkouts() {
    if (!window.confirm('Clear all saved workouts? This cannot be undone.')) {
      return;
    }

    if (persistWorkouts([])) {
      setNotice('');
    }
  }

  return (
    <div className="app-shell">
      {activeGoalNotifications.length > 0 && (
        <aside className="goal-toast-stack" aria-live="polite">
          <div className="pr-toast-heading">
            <div>
              <span className="eyebrow">GOAL MILESTONE</span>
              <strong>Progress worth celebrating</strong>
            </div>
            <button
              type="button"
              className="pr-toast-dismiss-all"
              onClick={() => setActiveGoalNotifications([])}
              aria-label="Dismiss all goal notifications"
            >
              ×
            </button>
          </div>
          <div className="pr-toast-list">
            {activeGoalNotifications.map(notification => (
              <div className="pr-toast goal-toast" key={notification.id}>
                <div>
                  <strong>{notification.title}</strong>
                  <span>{notification.milestone}% milestone</span>
                  <p>
                    {notification.current.toLocaleString('en-US')} {notification.unit}
                    {' '}of {notification.target.toLocaleString('en-US')} {notification.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissGoalNotification(notification.id)}
                  aria-label={`Dismiss ${notification.title} notification`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}
      {activePRNotifications.length > 0 && (
        <aside className="pr-toast-stack" aria-live="polite">
          <div className="pr-toast-heading">
            <div>
              <span className="eyebrow">PERSONAL RECORDS</span>
              <strong>New best performance</strong>
            </div>
            <button
              type="button"
              className="pr-toast-dismiss-all"
              onClick={() => setActivePRNotifications([])}
              aria-label="Dismiss all PR notifications"
            >
              ×
            </button>
          </div>
          <div className="pr-toast-list">
            {activePRNotifications.map(notification => (
              <div className="pr-toast" key={notification.id}>
                <div>
                  <strong>{notification.exerciseName}</strong>
                  <span>{notification.category}</span>
                  <p>
                    {notification.previousValue === null
                      ? 'First recorded best'
                      : `${notification.previousValue.toLocaleString('en-US')} ${notification.unit} → `}
                    <b>{notification.value.toLocaleString('en-US')} {notification.unit}</b>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissPRNotification(notification.id)}
                  aria-label={`Dismiss ${notification.exerciseName} ${notification.category} notification`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}
      <aside className="sidebar">
        <div className="brand">
          <span>ZENTRAQ<span className="brand-light"> FORGE</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-nav">
          <a className="nav-item active" href="#overview">Overview</a>
          <a className="nav-item" href="#history">Workout history</a>
          <a className="nav-item" href="#progress">Progress</a>
          <a className="nav-item" href="#insights">Insights</a>
          <a className="nav-item" href="#body-tracker">Body tracker</a>
          <a className="nav-item" href="#personal-records">Personal records</a>
          <a className="nav-item" href="#pr-notifications">PR notifications</a>
          <a className="nav-item" href="#goals">Goals & milestones</a>
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

        <section className="panel body-overview-card">
          <div>
            <div className="eyebrow">TRANSFORMATION SNAPSHOT</div>
            <h2>Body metrics</h2>
            <p className="history-subtitle">
              {latestBodyEntry
                ? `Latest check-in · ${latestBodyEntry.date}`
                : 'Record your first check-in to track your transformation.'}
            </p>
          </div>
          {latestBodyEntry ? (
            <div className="body-overview-metrics">
              <div>
                <span>CURRENT WEIGHT</span>
                <strong>{formatMetricValue(convertWeightFromKg(latestBodyValue, latestBodyEntry.weightUnit || 'kg'))} {latestBodyEntry.weightUnit || 'kg'}</strong>
              </div>
              <div>
                <span>CHANGE SINCE START</span>
                <strong className={bodyWeightChange >= 0 ? 'body-change-up' : 'body-change-down'}>
                  {bodyWeightChange >= 0 ? '+' : ''}{formatMetricValue(convertWeightFromKg(bodyWeightChange, latestBodyEntry.weightUnit || 'kg'))} {latestBodyEntry.weightUnit || 'kg'}
                </strong>
              </div>
              <div className="body-mini-trend">
                {bodyChartEntries.slice(-7).map(entry => (
                  <span
                    key={`${entry.id}-mini`}
                    style={{
                      height: `${Math.max(12, (entry.weightKg / Math.max(...bodyChartEntries.slice(-7).map(item => item.weightKg), 1)) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button className="secondary-button" onClick={openBodyBuilder}>+ Add check-in</button>
          )}
          {latestBodyEntry && (
            <a className="secondary-button body-overview-link" href="#body-tracker">Open body tracker ↗</a>
          )}
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

        {/* WORKOUT INSIGHTS */}
        <section className="panel insights-panel" id="insights">
          <div className="history-heading insights-heading">
            <div>
              <div className="eyebrow">DATA-DRIVEN TRAINING</div>
              <h2>Workout insights</h2>
              <p className="history-subtitle">
                Understand your performance, consistency, and training balance.
              </p>
            </div>
            <label className="insights-range-control">
              <span>DATE RANGE</span>
              <select
                value={insightRange}
                onChange={event => setInsightRange(event.target.value)}
                aria-label="Insights date range"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </label>
          </div>

          {insightWorkouts.length ? (
            <>
              <div className="insight-stat-grid">
                <article className="insight-stat-card">
                  <span>WORKOUTS</span>
                  <strong>{insightWorkouts.length}</strong>
                  <small>{insightFrequencyChange === null ? 'Selected period' : `${insightFrequencyChange >= 0 ? '+' : ''}${insightFrequencyChange.toFixed(0)}% vs previous`}</small>
                </article>
                <article className="insight-stat-card">
                  <span>TRAINING TIME</span>
                  <strong>{insightTotalDuration} <small>min</small></strong>
                  <small>{previousDuration ? `${((insightTotalDuration - previousDuration) / previousDuration * 100).toFixed(0)}% vs previous` : 'Recorded duration'}</small>
                </article>
                <article className="insight-stat-card">
                  <span>TOTAL VOLUME</span>
                  <strong>{insightTotalVolume.toLocaleString('en-US')} <small>kg</small></strong>
                  <small>{insightVolumeChange === null ? 'Selected period' : `${insightVolumeChange >= 0 ? '+' : ''}${insightVolumeChange.toFixed(0)}% vs previous`}</small>
                </article>
                <article className="insight-stat-card">
                  <span>AVG WORKOUT</span>
                  <strong>{Math.round(insightTotalDuration / insightWorkouts.length)} <small>min</small></strong>
                  <small>{Math.round(insightTotalVolume / insightWorkouts.length).toLocaleString('en-US')} kg average volume</small>
                </article>
                <article className="insight-stat-card">
                  <span>MOST ACTIVE DAY</span>
                  <strong>{mostActiveDayEntry ? mostActiveDayEntry[0] : '—'}</strong>
                  <small>{mostActiveDayEntry ? `${mostActiveDayEntry[1]} active day${mostActiveDayEntry[1] === 1 ? '' : 's'}` : 'Not enough data'}</small>
                </article>
                <article className="insight-stat-card">
                  <span>CURRENT STREAK</span>
                  <strong>{currentStreak} <small>days</small></strong>
                  <small>Longest in period: {getLongestStreak(insightWorkouts)} days</small>
                </article>
              </div>

              <div className="insight-chart-grid">
                <article className="insight-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">VOLUME TREND</span>
                      <h3>Training volume</h3>
                    </div>
                    <select
                      value={insightVolumeView}
                      onChange={event => setInsightVolumeView(event.target.value)}
                      aria-label="Volume chart view"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="insight-volume-chart">
                    {insightVolumeEntries.length ? insightVolumeEntries.map(entry => (
                      <div className="insight-volume-column" key={entry.label}>
                        <strong>{entry.volume >= 1000 ? `${(entry.volume / 1000).toFixed(1)}k` : entry.volume}</strong>
                        <div className="insight-volume-track">
                          <div
                            className="insight-volume-bar"
                            style={{ height: `${Math.max(4, (entry.volume / maxInsightVolume) * 100)}%` }}
                          />
                        </div>
                        <span>{entry.label.slice(insightVolumeView === 'monthly' ? 0 : 5)}</span>
                      </div>
                    )) : (
                      <div className="progress-empty">No volume data in this range.</div>
                    )}
                  </div>
                </article>

                <article className="insight-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">CONSISTENCY</span>
                      <h3>Activity calendar</h3>
                    </div>
                    <span className="panel-tag">{Math.round(insightConsistencyPercentage)}% active</span>
                  </div>
                  <div className="insight-heatmap" aria-label="Workout activity calendar">
                    {heatmapDays.map(day => (
                      <span
                        key={day.dateKey}
                        className={`heatmap-cell level-${Math.min(day.count, 3)}`}
                        title={`${day.dateKey}: ${day.count} workout${day.count === 1 ? '' : 's'}`}
                      />
                    ))}
                  </div>
                  <div className="consistency-summary">
                    <span><strong>{insightActiveDayCount}</strong> active days</span>
                    <span><strong>{insightRestDays}</strong> rest days</span>
                    <span><strong>{insightAverageWorkoutsPerWeek.toFixed(1)}</strong> workouts/week</span>
                    <span><strong>{getLongestStreak(insightWorkouts)}</strong> longest streak</span>
                  </div>
                </article>
              </div>

              <div className="insight-chart-grid">
                <article className="insight-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">TRAINING BALANCE</span>
                      <h3>Muscle group distribution</h3>
                    </div>
                    <span className="panel-tag">BY VOLUME</span>
                  </div>
                  <div className="muscle-distribution">
                    {insightMuscleDistribution.map(item => {
                      const percentage = totalMuscleVolume
                        ? (item.volume / totalMuscleVolume) * 100
                        : 0;
                      return (
                        <div className="muscle-row" key={item.group}>
                          <div className="muscle-row-heading">
                            <span>{item.group}</span>
                            <strong>{Math.round(percentage)}% · {item.volume.toLocaleString('en-US')} kg</strong>
                          </div>
                          <div className="muscle-track">
                            <div className="muscle-bar" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="classification-list">
                    <span className="panel-kicker">CLASSIFY EXERCISES</span>
                    {exerciseNames.map(name => (
                      <label key={name}>
                        <span>{name}</span>
                        <select
                          value={classifyExercise(name, muscleOverrides)}
                          onChange={event => updateMuscleClassification(name, event.target.value)}
                          aria-label={`Classify ${name}`}
                        >
                          {MUSCLE_GROUPS.map(group => <option value={group} key={group}>{group}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </article>

                <article className="insight-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">PERFORMANCE SIGNALS</span>
                      <h3>Exercise performance</h3>
                    </div>
                    <span className="panel-tag">SELECTED RANGE</span>
                  </div>
                  {exerciseInsightRows.length ? (
                    <div className="exercise-insight-list">
                      {exerciseInsightRows
                        .slice()
                        .sort((a, b) => b.bestVolume - a.bestVolume)
                        .slice(0, 5)
                        .map(row => (
                          <div className="exercise-insight-row" key={row.name}>
                            <div>
                              <strong>{row.name}</strong>
                              <span>{row.sessions} session{row.sessions === 1 ? '' : 's'}</span>
                            </div>
                            <div>
                              <strong>{row.bestWeight.toLocaleString('en-US')} kg</strong>
                              <span>best weight</span>
                            </div>
                            <div>
                              <strong>{row.bestVolume.toLocaleString('en-US')} kg</strong>
                              <span>best volume</span>
                            </div>
                            <b className={row.weightChange >= 0 ? 'positive-change' : 'negative-change'}>
                              {row.sessions >= 2 ? `${row.weightChange >= 0 ? '+' : ''}${row.weightChange} kg` : 'baseline'}
                            </b>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="progress-empty">Complete an exercise in at least two sessions to see progression.</div>
                  )}
                  <div className="insight-mini-summary">
                    <span>Most frequent: <strong>{mostFrequentExercises[0]?.name || '—'}</strong></span>
                    <span>Greatest improvement: <strong>{strongestProgression?.name || 'Need 2 sessions'}</strong></span>
                    <span>Declining trend: <strong>{decliningExercise?.name || 'None detected'}</strong></span>
                  </div>
                </article>
              </div>

              {insightCards.length ? (
                <div className="smart-insight-grid">
                  {insightCards.map(card => (
                    <article className="smart-insight-card" key={card}>
                      <span>✦</span>
                      <p>{card}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="progress-empty">More training history is needed to generate comparative insights.</div>
              )}
            </>
          ) : (
            <div className="insights-empty">
              <h3>Insights start with your next session.</h3>
              <p>Save workouts to see volume trends, consistency, muscle balance, and performance signals.</p>
              <button className="secondary-button" onClick={openLogger}>Log a workout</button>
            </div>
          )}
        </section>

        {/* BODY TRACKER */}
        <section className="panel body-tracker-panel" id="body-tracker">
          <div className="history-heading body-tracker-heading">
            <div>
              <div className="eyebrow">TRANSFORMATION TRACKER</div>
              <h2>Body tracker</h2>
              <p className="history-subtitle">
                Record check-ins and see how your measurements change over time.
              </p>
            </div>
            <div className="body-tracker-actions">
              <label className="body-range-control">
                <span>DATE RANGE</span>
                <select
                  value={bodyRange}
                  onChange={event => setBodyRange(event.target.value)}
                  aria-label="Body tracker date range"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="all">All time</option>
                </select>
              </label>
              <button className="primary-button" onClick={openBodyBuilder}>+ Add check-in</button>
            </div>
          </div>

          {bodyEntries.length ? (
            <>
              <div className="body-stat-grid">
                <article className="body-stat-card">
                  <span>CURRENT WEIGHT</span>
                  <strong>
                    {latestBodyValue
                      ? `${formatMetricValue(convertWeightFromKg(latestBodyValue, latestBodyEntry.weightUnit || 'kg'))} ${latestBodyEntry.weightUnit || 'kg'}`
                      : '—'}
                  </strong>
                  <small>{latestBodyEntry?.date || 'No weight recorded'}</small>
                </article>
                <article className="body-stat-card">
                  <span>STARTING WEIGHT</span>
                  <strong>
                    {startingBodyValue
                      ? `${formatMetricValue(convertWeightFromKg(startingBodyValue, firstBodyEntry.weightUnit || 'kg'))} ${firstBodyEntry.weightUnit || 'kg'}`
                      : '—'}
                  </strong>
                  <small>{firstBodyEntry?.date || 'No weight recorded'}</small>
                </article>
                <article className="body-stat-card">
                  <span>WEIGHT CHANGE</span>
                  <strong className={bodyWeightChange >= 0 ? 'body-change-up' : 'body-change-down'}>
                    {latestBodyValue && startingBodyValue
                      ? `${bodyWeightChange >= 0 ? '+' : ''}${formatMetricValue(convertWeightFromKg(bodyWeightChange, latestBodyEntry.weightUnit || 'kg'))} ${latestBodyEntry.weightUnit || 'kg'}`
                      : '—'}
                  </strong>
                  <small>Since first entry</small>
                </article>
                <article className="body-stat-card">
                  <span>CHECK-INS</span>
                  <strong>{bodyEntries.length}</strong>
                  <small>Measurement entries</small>
                </article>
              </div>

              <div className="body-chart-grid">
                <article className="body-chart-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">WEIGHT TREND</span>
                      <h3>Body weight progression</h3>
                    </div>
                    <span className="panel-tag">
                      {bodyRangeWeightChange === null
                        ? 'SELECTED RANGE'
                        : `${bodyRangeWeightChange >= 0 ? '+' : ''}${formatMetricValue(bodyRangeWeightChange)} kg`}
                    </span>
                  </div>
                  {bodyChartEntries.length > 1 ? (
                    <svg className="body-line-chart" viewBox="0 0 640 190" role="img" aria-label="Body weight progression chart">
                      <polyline
                        points={bodyChartEntries.map((entry, index) => {
                          const min = Math.min(...bodyChartEntries.map(item => item.weightKg));
                          const max = Math.max(...bodyChartEntries.map(item => item.weightKg));
                          const x = bodyChartEntries.length === 1 ? 320 : 24 + (index / (bodyChartEntries.length - 1)) * 592;
                          const y = 160 - ((entry.weightKg - min) / (max - min || 1)) * 125;
                          return `${x},${y}`;
                        }).join(' ')}
                        className="body-chart-line"
                      />
                      {bodyChartEntries.map((entry, index) => {
                        const min = Math.min(...bodyChartEntries.map(item => item.weightKg));
                        const max = Math.max(...bodyChartEntries.map(item => item.weightKg));
                        const x = bodyChartEntries.length === 1 ? 320 : 24 + (index / (bodyChartEntries.length - 1)) * 592;
                        const y = 160 - ((entry.weightKg - min) / (max - min || 1)) * 125;
                        return <circle key={entry.id} cx={x} cy={y} r="5" className="body-chart-point"><title>{`${entry.date}: ${formatMetricValue(entry.weightKg)} kg`}</title></circle>;
                      })}
                    </svg>
                  ) : (
                    <div className="progress-empty">Record at least two body-weight entries to see a trend.</div>
                  )}
                  {bodyChartEntries.length > 1 && (
                    <div className="body-chart-labels">
                      <span>{bodyChartEntries[0].date}</span>
                      <span>{bodyChartEntries[bodyChartEntries.length - 1].date}</span>
                    </div>
                  )}
                </article>

                <article className="body-chart-card">
                  <div className="insight-card-heading">
                    <div>
                      <span className="eyebrow">MEASUREMENT PROGRESSION</span>
                      <h3>Track a body part</h3>
                    </div>
                    <select
                      value={selectedBodyPart}
                      onChange={event => setSelectedBodyPart(event.target.value)}
                      aria-label="Body part progression"
                    >
                      {BODY_PARTS.map(part => <option value={part} key={part}>{part}</option>)}
                    </select>
                  </div>
                  {selectedBodyMeasurements.length > 1 ? (
                    <div className="body-measurement-trend">
                      {selectedBodyMeasurements.map((entry, index) => (
                        <div key={entry.id} className="body-measurement-point">
                          <strong>{formatMetricValue(convertLengthFromCm(entry.measurementsCm[selectedBodyPart], entry.measurementUnit || 'cm'))}</strong>
                          <span>{entry.measurementUnit || 'cm'} · {entry.date}</span>
                          {index < selectedBodyMeasurements.length - 1 && <i />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="progress-empty">Record this measurement twice to see progression.</div>
                  )}
                </article>
              </div>

              <div className="body-history-heading">
                <div>
                  <span className="eyebrow">CHECK-IN HISTORY</span>
                  <h3>Measurements over time</h3>
                </div>
                <div className="body-history-tools">
                  <input
                    type="search"
                    value={bodySearch}
                    onChange={event => setBodySearch(event.target.value)}
                    placeholder="Search notes or body parts..."
                    aria-label="Search body measurements"
                  />
                  <select value={bodySort} onChange={event => setBodySort(event.target.value)} aria-label="Sort body measurements">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
              <div className="body-history-list">
                {bodyHistoryEntries.length ? bodyHistoryEntries.map(entry => (
                  <article className="body-history-row" key={entry.id}>
                    <div className="body-history-date"><strong>{entry.date}</strong><span>{Object.keys(entry.measurementsCm || {}).length} measurements</span></div>
                    <div className="body-history-weight">
                      <span>WEIGHT</span>
                      <strong>{entry.weightKg ? `${formatMetricValue(convertWeightFromKg(entry.weightKg, entry.weightUnit || 'kg'))} ${entry.weightUnit || 'kg'}` : '—'}</strong>
                    </div>
                    <div className="body-history-parts">
                      {Object.entries(entry.measurementsCm || {}).slice(0, 4).map(([part, value]) => (
                        <span key={part}>{part}: {formatMetricValue(convertLengthFromCm(value, entry.measurementUnit || 'cm'))} {entry.measurementUnit || 'cm'}</span>
                      ))}
                      {Object.keys(entry.measurementsCm || {}).length > 4 && <span>+{Object.keys(entry.measurementsCm).length - 4} more</span>}
                    </div>
                    <p>{entry.notes || 'No notes added.'}</p>
                    <div className="record-actions">
                      <button className="record-edit" type="button" onClick={() => openBodyEditor(entry)}>Edit</button>
                      <button className="record-delete" type="button" onClick={() => deleteBodyEntry(entry.id)}>Delete</button>
                    </div>
                  </article>
                )) : <div className="progress-empty">No body entries match your search or date range.</div>}
              </div>
            </>
          ) : (
            <div className="insights-empty">
              <h3>Your transformation starts with a check-in.</h3>
              <p>Record body weight or any measurements to begin tracking change over time.</p>
              <button className="secondary-button" onClick={openBodyBuilder}>Add your first check-in</button>
            </div>
          )}
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

              {/* EXERCISE PROGRESS CHART */}
              <div className="exercise-progress-chart">
                <div className="exercise-chart-heading">
                  <div>
                    <h3>Exercise progress</h3>
                    <p>Track how your performance changes across sessions.</p>
                  </div>
                  <select
                    value={exerciseChartMetric}
                    onChange={event => setExerciseChartMetric(event.target.value)}
                    aria-label="Select exercise chart metric"
                  >
                    <option value="weight">Weight</option>
                    <option value="volume">Volume</option>
                    <option value="reps">Reps</option>
                  </select>
                </div>

                {chartEntries.length ? (
                  <>
                    <div className="exercise-chart-value">
                      <strong>{chartConfig.value(exerciseHistory[0]).toLocaleString('en-US')}</strong>
                      <span>{chartConfig.unit} · latest session</span>
                    </div>

                    <div className="exercise-chart-svg-wrap">
                      <svg
                        className="exercise-chart-svg"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        role="img"
                        aria-label={`${chartConfig.label} progress chart`}
                      >
                        {[0, 1, 2, 3].map(line => {
                          const y = chartPadding + (line / 3) * (chartHeight - chartPadding * 2);
                          return (
                            <line
                              key={line}
                              x1={chartPadding}
                              x2={chartWidth - chartPadding}
                              y1={y}
                              y2={y}
                              className="exercise-chart-gridline"
                            />
                          );
                        })}

                        {chartPoints.length > 1 && (
                          <polyline
                            points={chartPolyline}
                            className="exercise-chart-line"
                          />
                        )}

                        {chartPoints.map((point, index) => (
                          <circle
                            key={`${point.entry.id}-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            className="exercise-chart-point"
                          >
                            <title>
                              {`${point.entry.date}: ${point.value} ${chartConfig.unit}`}
                            </title>
                          </circle>
                        ))}
                      </svg>
                    </div>

                    <div className="exercise-chart-labels">
                      <span>{chartEntries[0].date}</span>
                      <span>{chartEntries[chartEntries.length - 1].date}</span>
                    </div>
                  </>
                ) : (
                  <div className="progress-empty">
                    Log sessions for this exercise to see its progress chart.
                  </div>
                )}
              </div>

              {/* CURRENT VS PREVIOUS SESSION COMPARISON */}
              <div className="session-comparison-card">
                <div className="session-comparison-heading">
                  <div>
                    <h3>Session comparison</h3>
                    <p>Compare your two most recent {activeExercise} sessions.</p>
                  </div>
                  <span className="panel-tag">AUTO-UPDATED</span>
                </div>

                {currentExerciseSession && previousExerciseSession ? (
                  <>
                    <div className="session-comparison-dates">
                      <div>
                        <span>LATEST SESSION</span>
                        <strong>{currentExerciseSession.date}</strong>
                        <small>{currentExerciseSession.workoutName}</small>
                      </div>
                      <div>
                        <span>PREVIOUS SESSION</span>
                        <strong>{previousExerciseSession.date}</strong>
                        <small>{previousExerciseSession.workoutName}</small>
                      </div>
                    </div>

                    <div className="session-comparison-grid">
                      {exerciseComparison.map(metric => (
                        <div className="session-comparison-metric" key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>
                            {metric.current.toLocaleString('en-US')} {metric.unit}
                          </strong>
                          <small>
                            Previous: {metric.previous.toLocaleString('en-US')} {metric.unit}
                          </small>
                          <div className={`comparison-change ${metric.status}`}>
                            {metric.difference > 0 ? '+' : ''}
                            {metric.difference.toLocaleString('en-US')} {metric.unit}
                            {metric.percentage === null
                              ? ' · New baseline'
                              : ` · ${metric.percentage > 0 ? '+' : ''}${metric.percentage.toFixed(1)}%`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="progress-empty">
                    Complete this exercise in at least two saved workouts to compare sessions.
                  </div>
                )}
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

        <section className="panel goals-panel" id="goals">
          <div className="history-heading">
            <div>
              <div className="eyebrow">TRAIN WITH INTENTION</div>
              <h2>Goals & milestones</h2>
              <p className="history-subtitle">
                Set meaningful targets and let your training data track the way.
              </p>
            </div>
            <button className="primary-button" onClick={openGoalBuilder}>
              + Create goal
            </button>
          </div>

          {goalsWithProgress.length ? (
            <div className="goals-grid">
              {goalsWithProgress.map(goal => {
                const targetDate = new Date(`${goal.targetDate}T00:00:00`);
                const remainingDays = Math.max(
                  0,
                  Math.ceil((targetDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
                );
                const currentValue = goal.current.toLocaleString('en-US');
                const targetValue = Number(goal.targetValue).toLocaleString('en-US');

                return (
                  <article className={`goal-card ${goal.displayStatus}`} key={goal.id}>
                    <div className="goal-card-heading">
                      <div>
                        <span className="goal-type-label">{formatGoalType(goal.type)}</span>
                        <h3>{goal.title}</h3>
                        {goal.exerciseName && <p>{goal.exerciseName}</p>}
                      </div>
                      <span className={`goal-status ${goal.displayStatus}`}>
                        {goal.displayStatus}
                      </span>
                    </div>

                    <div className="goal-progress-summary">
                      <strong>{currentValue}</strong>
                      <span>/ {targetValue} {goal.unit}</span>
                      <b>{Math.round(goal.percentage)}%</b>
                    </div>
                    <div
                      className="goal-progress-track"
                      role="progressbar"
                      aria-valuenow={Math.round(goal.percentage)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${goal.title} progress`}
                    >
                      <div
                        className="goal-progress-bar"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>

                    <div className="goal-card-meta">
                      <span>{goal.startDate} → {goal.targetDate}</span>
                      <span>
                        {goal.displayStatus === 'completed'
                          ? `Completed ${goal.completionDate || goal.targetDate}`
                          : goal.displayStatus === 'expired'
                            ? 'Target date passed'
                            : goal.displayStatus === 'paused'
                              ? 'Progress paused'
                              : `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} remaining`}
                      </span>
                    </div>

                    <div className="goal-card-actions">
                      <button
                        type="button"
                        className="record-edit"
                        onClick={() => openGoalEditor(goal)}
                      >
                        Edit
                      </button>
                      {(goal.displayStatus === 'active' || goal.displayStatus === 'paused') && (
                        <button
                          type="button"
                          className="goal-pause-button"
                          onClick={() => toggleGoalPause(goal)}
                        >
                          {goal.displayStatus === 'paused' ? 'Resume' : 'Pause'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="record-delete"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="goal-empty-state">
              <h3>Make your next milestone measurable.</h3>
              <p>Create a strength, frequency, volume, or consistency goal to get started.</p>
              <button className="secondary-button" onClick={openGoalBuilder}>
                Create your first goal
              </button>
            </div>
          )}
        </section>

        <section className="panel goal-history-panel" id="goal-history">
          <div className="history-heading">
            <div>
              <div className="eyebrow">MILESTONE LOG</div>
              <h2>Goal achievements</h2>
              <p className="history-subtitle">Milestones are recorded once and remain available after refresh.</p>
            </div>
            <span className="panel-tag">{goalNotifications.length} MILESTONES</span>
          </div>

          {goalNotifications.length ? (
            <div className="goal-history-list">
              {goalNotifications.map(notification => (
                <article className="goal-history-row" key={notification.id}>
                  <div className="pr-history-icon">✦</div>
                  <div className="pr-history-main">
                    <strong>{notification.title}</strong>
                    <span>{notification.milestone}% milestone</span>
                  </div>
                  <div className="pr-history-values">
                    <strong>{notification.current.toLocaleString('en-US')} {notification.unit}</strong>
                    <span>Target: {notification.target.toLocaleString('en-US')} {notification.unit}</span>
                  </div>
                  <div className="pr-history-date">{notification.date}</div>
                  <button
                    type="button"
                    className="pr-history-dismiss"
                    onClick={() => dismissGoalHistoryItem(notification.id)}
                  >
                    Dismiss
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="progress-empty">Goal milestones will appear here as you progress.</div>
          )}
        </section>

        <section className="panel pr-notifications-panel" id="pr-notifications">
          <div className="history-heading">
            <div>
              <div className="eyebrow">ACHIEVEMENT LOG</div>
              <h2>PR notifications</h2>
              <p className="history-subtitle">
                Every new personal best achieved in your saved workouts.
              </p>
            </div>
            <span className="panel-tag">{prNotifications.length} ACHIEVEMENTS</span>
          </div>

          {prNotifications.length ? (
            <div className="pr-history-list">
              {prNotifications.map(notification => (
                <article className="pr-history-row" key={notification.id}>
                  <div className="pr-history-icon">✦</div>
                  <div className="pr-history-main">
                    <strong>{notification.exerciseName}</strong>
                    <span>{notification.category} · {notification.workoutName}</span>
                  </div>
                  <div className="pr-history-values">
                    <strong>{notification.value.toLocaleString('en-US')} {notification.unit}</strong>
                    <span>
                      {notification.previousValue === null
                        ? 'First record'
                        : `From ${notification.previousValue.toLocaleString('en-US')} ${notification.unit}`}
                    </span>
                  </div>
                  <div className="pr-history-date">{notification.date}</div>
                  <button
                    type="button"
                    className="pr-history-dismiss"
                    onClick={() => dismissPRHistoryItem(notification.id)}
                    aria-label={`Dismiss ${notification.exerciseName} ${notification.category} history item`}
                  >
                    Dismiss
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="progress-empty">
              New personal bests will appear here after you save a workout.
            </div>
          )}
        </section>

        {/* PERSONAL RECORDS */}
        <section className="panel personal-records-panel" id="personal-records">
          <div className="history-heading">
            <div>
              <div className="eyebrow">YOUR BEST PERFORMANCE</div>
              <h2>Personal records</h2>
              <p className="history-subtitle">
                Your best lifts and exercise performances, calculated from saved sessions.
              </p>
            </div>
            <span className="panel-tag">AUTO-UPDATED</span>
          </div>

          {personalRecords.length ? (
            <div className="personal-records-grid">
              {personalRecords.map(record => (
                <article className="personal-record-card" key={record.name}>
                  <div className="personal-record-card-heading">
                    <h3>{record.name}</h3>
                    <span>
                      {record.sessions} {record.sessions === 1 ? 'SESSION' : 'SESSIONS'}
                    </span>
                  </div>

                  <div className="personal-record-metrics">
                    <div className="personal-record-metric">
                      <span>HEAVIEST WEIGHT</span>
                      <strong>
                        {record.heaviest.weight.toLocaleString('en-US')} <small>kg</small>
                      </strong>
                      <p>{record.heaviest.date} · {record.heaviest.workoutName}</p>
                    </div>

                    <div className="personal-record-metric">
                      <span>MOST REPS</span>
                      <strong>{record.mostReps.reps} <small>reps</small></strong>
                      <p>{record.mostReps.date} · {record.mostReps.workoutName}</p>
                    </div>

                    <div className="personal-record-metric">
                      <span>HIGHEST VOLUME</span>
                      <strong>
                        {record.highestVolume.volume.toLocaleString('en-US')} <small>kg</small>
                      </strong>
                      <p>
                        {record.highestVolume.sets} sets × {record.highestVolume.reps} reps · {record.highestVolume.date}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="progress-empty">
              Save workouts with exercise sets, reps, and weights to start building your personal records.
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
                  plans.find(plan => plan.id === activePlanId) || plans[0];

                if (!activePlan) return null;

                const completedCount = activePlan.days.filter(day =>
                  (day.completedDates || []).includes(localDateKey())
                ).length;

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
                        const completed = (day.completedDates || []).includes(localDateKey());

                        return (
                          <article
                            className={completed ? 'plan-day-card completed' : 'plan-day-card'}
                            key={day.id}
                          >
                            <div className="plan-day-top">
                              <span>DAY {String(index + 1).padStart(2, '0')}</span>
                              {completed && (
                                <span className="plan-complete-label">COMPLETED</span>
                              )}
                            </div>

                            <h4>{day.name}</h4>

                            <ul>
                              {day.exercises.map((exercise, exerciseIndex) => (
                                <li key={`${day.id}-${exerciseIndex}`}>{exercise}</li>
                              ))}
                            </ul>

                            <button
                              className={completed ? 'plan-complete-button done' : 'plan-complete-button'}
                              onClick={() => togglePlanDay(activePlan.id, day.id)}
                            >
                              {completed ? 'Undo completion' : 'Mark completed'}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
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
                    {workout.sample && <span className="demo-label">DEMO DATA</span>}
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
              <div className="empty-history">No workouts match your search.</div>
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

      {/* BODY METRICS MODAL */}
      {showBodyBuilder && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowBodyBuilder(false);
              setEditingBodyEntryId(null);
            }
          }}
        >
          <section className="workout-modal body-builder-modal" role="dialog" aria-modal="true" aria-labelledby="body-builder-title">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">{editingBodyEntryId ? 'UPDATE CHECK-IN' : 'NEW CHECK-IN'}</div>
                <h2 id="body-builder-title">{editingBodyEntryId ? 'Edit body metrics' : 'Record body metrics'}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowBodyBuilder(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={saveBodyEntry}>
              <div className="body-form-grid">
                <label className="form-label">
                  Measurement date
                  <input type="date" value={measurementDate} onChange={event => setMeasurementDate(event.target.value)} required />
                </label>
                <label className="form-label">
                  Body weight
                  <div className="unit-input">
                    <input type="number" min="0.01" step="0.01" value={bodyWeight} onChange={event => setBodyWeight(event.target.value)} placeholder="Optional" />
                    <select value={bodyWeightUnit} onChange={event => setBodyWeightUnit(event.target.value)} aria-label="Body weight unit">
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </label>
              </div>
              <div className="form-label">
                <div className="body-form-section-heading">
                  <span>Body measurements</span>
                  <select value={measurementUnit} onChange={event => setMeasurementUnit(event.target.value)} aria-label="Measurement unit">
                    <option value="cm">Centimeters</option>
                    <option value="in">Inches</option>
                  </select>
                </div>
                <div className="body-measurement-form-grid">
                  {BODY_PARTS.map(part => (
                    <label key={part}>
                      <span>{part}</span>
                      <input type="number" min="0.01" step="0.01" value={measurementValues[part] || ''} onChange={event => updateMeasurementValue(part, event.target.value)} placeholder="Optional" />
                    </label>
                  ))}
                </div>
              </div>
              <label className="form-label">
                Notes
                <textarea rows="3" value={measurementNotes} onChange={event => setMeasurementNotes(event.target.value)} placeholder="How are you feeling?"></textarea>
              </label>
              {notice && <p className="form-notice">{notice}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowBodyBuilder(false)}>Cancel</button>
                <button type="submit" className="primary-button">{editingBodyEntryId ? 'Save changes' : 'Save check-in'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* GOAL BUILDER MODAL */}
      {showGoalBuilder && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowGoalBuilder(false);
              setEditingGoalId(null);
            }
          }}
        >
          <section
            className="workout-modal goal-builder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-builder-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">{editingGoalId ? 'REFINE YOUR TARGET' : 'NEW MILESTONE'}</div>
                <h2 id="goal-builder-title">
                  {editingGoalId ? 'Edit goal' : 'Create a goal'}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowGoalBuilder(false);
                  setEditingGoalId(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveGoal}>
              <label className="form-label">
                Goal title
                <input
                  value={goalTitle}
                  onChange={event => setGoalTitle(event.target.value)}
                  placeholder="e.g. Bench press milestone"
                  required
                />
              </label>

              <label className="form-label">
                Goal type
                <select
                  value={goalType}
                  onChange={event => setGoalType(event.target.value)}
                >
                  <option value="strength">Strength goal</option>
                  <option value="frequency">Workout frequency</option>
                  <option value="volume">Training volume</option>
                  <option value="consistency">Consistency</option>
                </select>
              </label>

              {goalType === 'strength' && (
                <label className="form-label">
                  Exercise
                  <select
                    value={goalExerciseName}
                    onChange={event => setGoalExerciseName(event.target.value)}
                    required
                  >
                    <option value="">Select an exercise</option>
                    {exerciseNames.map(name => (
                      <option value={name} key={name}>{name}</option>
                    ))}
                  </select>
                  {!exerciseNames.length && (
                    <small className="form-help">Save an exercise first to create a strength goal.</small>
                  )}
                </label>
              )}

              <label className="form-label">
                Target value
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={goalTargetValue}
                  onChange={event => setGoalTargetValue(event.target.value)}
                  placeholder={
                    goalType === 'strength' || goalType === 'volume'
                      ? 'e.g. 100'
                      : 'e.g. 4'
                  }
                  required
                />
                <small className="form-help">
                  {goalType === 'strength' || goalType === 'volume'
                    ? 'Measured in kilograms.'
                    : goalType === 'frequency'
                      ? 'Number of workouts this week.'
                      : 'Number of consecutive days.'}
                </small>
              </label>

              <div className="goal-date-fields">
                <label className="form-label">
                  Start date
                  <input
                    type="date"
                    value={goalStartDate}
                    onChange={event => setGoalStartDate(event.target.value)}
                    required
                  />
                </label>
                <label className="form-label">
                  Target date
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={event => setGoalTargetDate(event.target.value)}
                    min={goalStartDate}
                    required
                  />
                </label>
              </div>

              {notice && <p className="form-notice">{notice}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowGoalBuilder(false);
                    setEditingGoalId(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingGoalId ? 'Save changes' : 'Create goal'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* CREATE WORKOUT PLAN MODAL */}
      {showPlanBuilder && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowPlanBuilder(false);
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
                    <option key={template} value={template}>{template}</option>
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
              setShowLogger(false);
              setEditingWorkoutId(null);
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
                  setShowLogger(false);
                  setEditingWorkoutId(null);
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
                    setShowLogger(false);
                    setEditingWorkoutId(null);
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
  );
}

export default App;