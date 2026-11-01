import { useEffect, useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'zentraq-workouts';
const PLANS_KEY = 'zentraq-workout-plans';
const PR_NOTIFICATIONS_KEY = 'zentraq-pr-notifications';
const GOALS_KEY = 'zentraq-goals';
const GOAL_NOTIFICATIONS_KEY = 'zentraq-goal-notifications';
const MUSCLE_OVERRIDES_KEY = 'zentraq-muscle-overrides';
const BODY_METRICS_KEY = 'zentraq-body-metrics';
const CUSTOM_EXERCISES_KEY = 'zentraq-custom-exercises';
const FAVORITE_EXERCISES_KEY = 'zentraq-exercise-favorites';
const RECENT_EXERCISES_KEY = 'zentraq-recent-exercises';
const TIMER_SESSION_KEY = 'zentraq-active-timer-session';
const TIMER_PREFERENCES_KEY = 'zentraq-timer-preferences';
const CUSTOM_FOODS_KEY = 'zentraq-custom-foods';
const NUTRITION_LOGS_KEY = 'zentraq-nutrition-logs';
const NUTRITION_TARGETS_KEY = 'zentraq-nutrition-targets';

const FOOD_CATEGORIES = [
  'Fruits', 'Vegetables', 'Grains', 'Dairy', 'Legumes',
  'Nuts and seeds', 'Meat and seafood', 'Beverages', 'Other',
];

const DEFAULT_NUTRITION_TARGETS = {
  calories: 2000,
  protein: 150,
  carbohydrates: 220,
  fat: 65,
  fibre: 25,
};

// Values are approximate estimates per listed serving and are labeled in the UI.
const BUILT_IN_FOODS = [
  { id: 'food-oats', name: 'Rolled oats', servingSize: 40, servingUnit: 'g', calories: 152, protein: 5, carbohydrates: 27, fat: 3, fibre: 4, sugar: 0, category: 'Grains', approximate: true },
  { id: 'food-banana', name: 'Banana', servingSize: 118, servingUnit: 'g', calories: 105, protein: 1, carbohydrates: 27, fat: 0, fibre: 3, sugar: 14, category: 'Fruits', approximate: true },
  { id: 'food-apple', name: 'Apple', servingSize: 182, servingUnit: 'g', calories: 95, protein: 0, carbohydrates: 25, fat: 0, fibre: 4, sugar: 19, category: 'Fruits', approximate: true },
  { id: 'food-rice', name: 'Cooked white rice', servingSize: 158, servingUnit: 'g', calories: 205, protein: 4, carbohydrates: 45, fat: 0, fibre: 1, sugar: 0, category: 'Grains', approximate: true },
  { id: 'food-chicken', name: 'Chicken breast, cooked', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbohydrates: 0, fat: 4, fibre: 0, sugar: 0, category: 'Meat and seafood', approximate: true },
  { id: 'food-egg', name: 'Egg', servingSize: 50, servingUnit: 'g', calories: 72, protein: 6, carbohydrates: 0, fat: 5, fibre: 0, sugar: 0, category: 'Dairy', approximate: true },
  { id: 'food-yogurt', name: 'Plain Greek yogurt', servingSize: 170, servingUnit: 'g', calories: 100, protein: 17, carbohydrates: 6, fat: 0, fibre: 0, sugar: 4, category: 'Dairy', approximate: true },
  { id: 'food-lentils', name: 'Cooked lentils', servingSize: 198, servingUnit: 'g', calories: 230, protein: 18, carbohydrates: 40, fat: 1, fibre: 16, sugar: 4, category: 'Legumes', approximate: true },
  { id: 'food-almonds', name: 'Almonds', servingSize: 28, servingUnit: 'g', calories: 164, protein: 6, carbohydrates: 6, fat: 14, fibre: 4, sugar: 1, category: 'Nuts and seeds', approximate: true },
  { id: 'food-milk', name: 'Milk, 2%', servingSize: 240, servingUnit: 'ml', calories: 122, protein: 8, carbohydrates: 12, fat: 5, fibre: 0, sugar: 12, category: 'Beverages', approximate: true },
];

const DEFAULT_TIMER_PREFERENCES = {
  defaultRestSeconds: 60,
  soundEnabled: true,
  autoRestPrompt: false,
  warningSeconds: 10,
};

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

const LIBRARY_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps',
  'Hamstrings', 'Glutes', 'Calves', 'Core', 'Forearms', 'Other',
];

const EXERCISE_EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine',
  'Resistance Band', 'Bodyweight', 'Kettlebell', 'Other',
];

const EXERCISE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const EXERCISE_TYPES = ['Weighted', 'Bodyweight', 'Duration-based', 'Distance-based'];
const GENERATOR_GOALS = [
  { value: 'hypertrophy', label: 'Muscle building / Hypertrophy' },
  { value: 'strength', label: 'Strength' },
  { value: 'fitness', label: 'General fitness' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'balanced', label: 'Balanced training' },
];
const GENERATOR_FREQUENCIES = [2, 3, 4, 5, 6];
const GENERATOR_DURATIONS = [30, 45, 60, 75, 90];
const GENERATOR_MUSCLES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core',
];
const GENERATOR_EQUIPMENT = [
  { value: 'full-gym', label: 'Full gym' },
  { value: 'Dumbbell', label: 'Dumbbells' },
  { value: 'Barbell', label: 'Barbell' },
  { value: 'Machine', label: 'Machines' },
  { value: 'Bodyweight', label: 'Bodyweight' },
  { value: 'Resistance Band', label: 'Resistance bands' },
  { value: 'custom', label: 'Custom equipment' },
];

const BUILT_IN_EXERCISES = [
  {
    id: 'bench-press', name: 'Bench Press', primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Barbell',
    category: 'Strength', difficulty: 'Intermediate', type: 'Weighted',
    description: 'A horizontal pressing exercise for building upper-body strength.',
    instructions: ['Set your eyes beneath the bar and grip it just outside shoulder width.', 'Lower the bar with control toward your mid-chest.', 'Press through both hands until your elbows are extended.'],
    tips: ['Keep your shoulder blades pulled back.', 'Use a controlled touch and avoid bouncing the bar.'],
    mistakes: ['Flaring the elbows excessively.', 'Lifting the hips from the bench.'],
  },
  {
    id: 'back-squat', name: 'Back Squat', primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'], equipment: 'Barbell',
    category: 'Strength', difficulty: 'Intermediate', type: 'Weighted',
    description: 'A compound lower-body exercise performed with a bar across the upper back.',
    instructions: ['Brace your trunk and position the bar securely across your upper back.', 'Sit down and back while keeping your feet planted.', 'Drive through the floor to stand tall.'],
    tips: ['Keep your knees tracking with your toes.', 'Maintain a neutral spine throughout the rep.'],
    mistakes: ['Allowing the knees to collapse inward.', 'Losing brace at the bottom.'],
  },
  {
    id: 'deadlift', name: 'Deadlift', primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back', 'Forearms'], equipment: 'Barbell',
    category: 'Strength', difficulty: 'Advanced', type: 'Weighted',
    description: 'A hip-hinge movement that trains the posterior chain.',
    instructions: ['Stand with the bar over your mid-foot.', 'Brace and hinge to grip the bar.', 'Push the floor away and stand with the bar close to your body.'],
    tips: ['Keep the bar close to your legs.', 'Brace before each repetition.'],
    mistakes: ['Rounding the lower back.', 'Jerking the bar from the floor.'],
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms'], equipment: 'Cable',
    category: 'Pull', difficulty: 'Beginner', type: 'Weighted',
    description: 'A vertical pulling exercise that emphasizes the lats.',
    instructions: ['Sit tall and grip the bar slightly wider than shoulder width.', 'Pull the bar toward your upper chest.', 'Return it slowly until your elbows extend.'],
    tips: ['Lead with your elbows.', 'Avoid swinging your torso.'],
    mistakes: ['Pulling behind the neck.', 'Using momentum instead of controlled tension.'],
  },
  {
    id: 'overhead-press', name: 'Overhead Press', primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Core'], equipment: 'Barbell',
    category: 'Strength', difficulty: 'Intermediate', type: 'Weighted',
    description: 'An overhead pressing movement for the shoulders and triceps.',
    instructions: ['Start with the bar at shoulder height.', 'Brace and press the bar overhead.', 'Lower it under control to the starting position.'],
    tips: ['Keep the ribs down.', 'Finish with the bar stacked over your shoulders and hips.'],
    mistakes: ['Leaning back excessively.', 'Pressing around the face instead of moving the head naturally.'],
  },
  {
    id: 'push-up', name: 'Push-Up', primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Core'], equipment: 'Bodyweight',
    category: 'Strength', difficulty: 'Beginner', type: 'Bodyweight',
    description: 'A bodyweight horizontal press with a scalable difficulty.',
    instructions: ['Place your hands beneath your shoulders.', 'Lower your chest while keeping your body in one line.', 'Press the floor away to return to the top.'],
    tips: ['Brace your glutes and abs.', 'Use a range of motion you can control.'],
    mistakes: ['Sagging the hips.', 'Moving the head instead of the torso.'],
  },
  {
    id: 'dumbbell-curl', name: 'Dumbbell Curl', primaryMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'], equipment: 'Dumbbell',
    category: 'Isolation', difficulty: 'Beginner', type: 'Weighted',
    description: 'An elbow-flexion exercise targeting the biceps.',
    instructions: ['Stand tall with a dumbbell in each hand.', 'Curl the weights while keeping your elbows near your sides.', 'Lower slowly to full elbow extension.'],
    tips: ['Keep the shoulders relaxed.', 'Avoid swinging the weights.'],
    mistakes: ['Using momentum.', 'Shortening the lowering phase.'],
  },
  {
    id: 'plank', name: 'Plank', primaryMuscle: 'Core',
    secondaryMuscles: ['Shoulders'], equipment: 'Bodyweight',
    category: 'Core', difficulty: 'Beginner', type: 'Duration-based',
    description: 'An isometric trunk exercise focused on maintaining a strong body line.',
    instructions: ['Set your elbows under your shoulders.', 'Brace your abdomen and squeeze your glutes.', 'Hold the position while breathing steadily.'],
    tips: ['Keep your hips level.', 'Stop before your position breaks down.'],
    mistakes: ['Holding your breath.', 'Allowing the lower back to arch.'],
  },
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

function normalizeExerciseName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

function loadCustomExercises() {
  return loadStoredArray(CUSTOM_EXERCISES_KEY)
    .filter(item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      item.name.trim()
    )
    .map(item => ({
      ...item,
      name: normalizeExerciseName(item.name),
      primaryMuscle: LIBRARY_MUSCLE_GROUPS.includes(item.primaryMuscle) ? item.primaryMuscle : 'Other',
      secondaryMuscles: Array.isArray(item.secondaryMuscles) ? item.secondaryMuscles : [],
      equipment: EXERCISE_EQUIPMENT.includes(item.equipment) ? item.equipment : 'Other',
      difficulty: EXERCISE_DIFFICULTIES.includes(item.difficulty) ? item.difficulty : 'Beginner',
      type: EXERCISE_TYPES.includes(item.type) ? item.type : 'Weighted',
      category: typeof item.category === 'string' && item.category.trim() ? item.category : 'Custom',
      description: typeof item.description === 'string' ? item.description : 'Custom exercise saved in your library.',
      instructions: Array.isArray(item.instructions) ? item.instructions.filter(step => typeof step === 'string') : [],
      tips: Array.isArray(item.tips) ? item.tips.filter(tip => typeof tip === 'string') : [],
      mistakes: Array.isArray(item.mistakes) ? item.mistakes.filter(mistake => typeof mistake === 'string') : [],
      custom: true,
    }));
}

function loadCustomFoods() {
  return loadStoredArray(CUSTOM_FOODS_KEY)
    .filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim())
    .map(item => ({
      ...item,
      name: normalizeExerciseName(item.name),
      servingSize: Number(item.servingSize) > 0 ? Number(item.servingSize) : 1,
      servingUnit: typeof item.servingUnit === 'string' && item.servingUnit.trim() ? item.servingUnit.trim() : 'serving',
      calories: Number(item.calories) >= 0 ? Number(item.calories) : 0,
      protein: Number(item.protein) >= 0 ? Number(item.protein) : 0,
      carbohydrates: Number(item.carbohydrates) >= 0 ? Number(item.carbohydrates) : 0,
      fat: Number(item.fat) >= 0 ? Number(item.fat) : 0,
      fibre: Number(item.fibre) >= 0 ? Number(item.fibre) : null,
      sugar: Number(item.sugar) >= 0 ? Number(item.sugar) : null,
      category: FOOD_CATEGORIES.includes(item.category) ? item.category : 'Other',
      custom: true,
    }));
}

function loadNutritionTargets() {
  const stored = loadStoredObject(NUTRITION_TARGETS_KEY);
  return Object.fromEntries(Object.entries(DEFAULT_NUTRITION_TARGETS).map(([key, fallback]) => [
    key,
    Number.isFinite(Number(stored[key])) && Number(stored[key]) > 0 ? Number(stored[key]) : fallback,
  ]));
}

function loadNutritionLogs() {
  return loadStoredArray(NUTRITION_LOGS_KEY)
    .filter(log => log && typeof log.date === 'string')
    .map(log => ({
      ...log,
      id: typeof log.id === 'string' ? log.id : crypto.randomUUID(),
      meals: Object.fromEntries(['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => [
        meal,
        Array.isArray(log.meals?.[meal])
          ? log.meals[meal].filter(entry =>
              entry &&
              typeof entry.id === 'string' &&
              typeof entry.name === 'string' &&
              entry.nutrients &&
              typeof entry.nutrients === 'object'
            )
          : [],
      ])),
      notes: Object.fromEntries(['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => [
        meal,
        typeof log.notes?.[meal] === 'string' ? log.notes[meal] : '',
      ])),
    }));
}

function loadStringArray(key) {
  return loadStoredArray(key).filter(item => typeof item === 'string');
}

function scaleFoodNutrition(food, quantity) {
  const multiplier = Number(quantity) || 0;
  const scale = multiplier;
  return {
    calories: food.calories * scale,
    protein: food.protein * scale,
    carbohydrates: food.carbohydrates * scale,
    fat: food.fat * scale,
    fibre: food.fibre === null || food.fibre === undefined ? null : food.fibre * scale,
    sugar: food.sugar === null || food.sugar === undefined ? null : food.sugar * scale,
  };
}

function nutritionEntryTotals(entries) {
  return entries.reduce((totals, entry) => {
    Object.keys(totals).forEach(key => {
      if (entry.nutrients[key] !== null && entry.nutrients[key] !== undefined) {
        totals[key] += Number(entry.nutrients[key]) || 0;
      }
    });
    return totals;
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fibre: 0, sugar: 0 });
}

function loadTimerSession() {
  const session = loadStoredObject(TIMER_SESSION_KEY);
  if (
    !session ||
    !['running', 'paused'].includes(session.status) ||
    !Number.isFinite(session.startedAt) ||
    !Number.isFinite(session.accumulatedMs)
  ) {
    return null;
  }

  return {
    ...session,
    status: session.status,
    pausedAt: Number.isFinite(session.pausedAt) ? session.pausedAt : null,
    workoutName: typeof session.workoutName === 'string' ? session.workoutName : '',
    exercises: Array.isArray(session.exercises) ? session.exercises : [],
  };
}

function loadTimerPreferences() {
  const stored = loadStoredObject(TIMER_PREFERENCES_KEY);
  return {
    ...DEFAULT_TIMER_PREFERENCES,
    ...stored,
    defaultRestSeconds: Number(stored.defaultRestSeconds) || DEFAULT_TIMER_PREFERENCES.defaultRestSeconds,
    warningSeconds: Number(stored.warningSeconds) || DEFAULT_TIMER_PREFERENCES.warningSeconds,
    soundEnabled: stored.soundEnabled !== false,
    autoRestPrompt: stored.autoRestPrompt === true,
  };
}

function getElapsedTimerMs(session, now = Date.now()) {
  if (!session) return 0;
  if (session.status === 'paused') {
    return session.accumulatedMs + Math.max(0, (session.pausedAt || now) - session.startedAt);
  }
  return session.accumulatedMs + Math.max(0, now - session.startedAt);
}

function formatWorkoutTime(milliseconds) {
  const totalMinutes = Math.floor(Math.max(0, milliseconds) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatRestTime(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getRestRemainingMs(timer, now = Date.now()) {
  if (!timer) return 0;
  if (timer.status === 'running') return Math.max(0, timer.endsAt - now);
  return Math.max(0, timer.remainingMs);
}

function playRestCompletionSound(soundEnabled) {
  if (!soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 660;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
  oscillator.addEventListener('ended', () => context.close());
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
  const initialTimerSession = loadTimerSession();
  const showAdvancedFeatures = Boolean(localStorage.getItem('zentraq-phase-2-preview'));
  const getScreenFromHash = () => {
    const hash = window.location.hash.slice(1);
    if (['history', 'plans', 'progress', 'personal-records', 'settings', 'workout-logger'].includes(hash)) {
      if (hash === 'settings') return 'history';
      return hash === 'workout-logger' ? 'workouts' : hash;
    }
    return 'dashboard';
  };
  const [activeScreen, setActiveScreen] = useState(getScreenFromHash);
  const [workouts, setWorkouts] = useState(loadWorkouts);
  const [showLogger, setShowLogger] = useState(Boolean(initialTimerSession));
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [workoutName, setWorkoutName] = useState(
    initialTimerSession?.workoutName || ''
  );
  const [duration, setDuration] = useState('45');
  const [exercises, setExercises] = useState(
    initialTimerSession?.exercises?.length
      ? initialTimerSession.exercises
      : [emptyExercise()]
  );
  const [notice, setNotice] = useState('');
  const [timerSession, setTimerSession] = useState(initialTimerSession);
  const [timerNow, setTimerNow] = useState(Date.now);
  const [timerPreferences, setTimerPreferences] = useState(loadTimerPreferences);
  const [restTimer, setRestTimer] = useState(null);
  const [restNow, setRestNow] = useState(Date.now);
  const [restPreset, setRestPreset] = useState('60');
  const [customRestSeconds, setCustomRestSeconds] = useState('60');
  const restCompletionRef = useRef(false);
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
  const [customFoods, setCustomFoods] = useState(loadCustomFoods);
  const [nutritionLogs, setNutritionLogs] = useState(
    loadNutritionLogs
  );
  const [nutritionTargets, setNutritionTargets] = useState(loadNutritionTargets);
  const [nutritionDate, setNutritionDate] = useState(localDateKey());
  const [nutritionFoodSearch, setNutritionFoodSearch] = useState('');
  const [nutritionFoodCategory, setNutritionFoodCategory] = useState('all');
  const [nutritionMeal, setNutritionMeal] = useState('breakfast');
  const [nutritionSelectedFoodId, setNutritionSelectedFoodId] = useState('');
  const [nutritionQuantity, setNutritionQuantity] = useState('1');
  const [showFoodBuilder, setShowFoodBuilder] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodBuilderName, setFoodBuilderName] = useState('');
  const [foodBuilderServingSize, setFoodBuilderServingSize] = useState('100');
  const [foodBuilderServingUnit, setFoodBuilderServingUnit] = useState('g');
  const [foodBuilderCalories, setFoodBuilderCalories] = useState('');
  const [foodBuilderProtein, setFoodBuilderProtein] = useState('');
  const [foodBuilderCarbohydrates, setFoodBuilderCarbohydrates] = useState('');
  const [foodBuilderFat, setFoodBuilderFat] = useState('');
  const [foodBuilderFibre, setFoodBuilderFibre] = useState('');
  const [foodBuilderSugar, setFoodBuilderSugar] = useState('');
  const [foodBuilderCategory, setFoodBuilderCategory] = useState('Other');
  const [nutritionHistoryRange, setNutritionHistoryRange] = useState('7');
  const [customExercises, setCustomExercises] = useState(loadCustomExercises);
  const [favoriteExercises, setFavoriteExercises] = useState(
    () => loadStringArray(FAVORITE_EXERCISES_KEY)
  );
  const [recentExercises, setRecentExercises] = useState(
    () => loadStringArray(RECENT_EXERCISES_KEY)
  );
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryMuscleFilter, setLibraryMuscleFilter] = useState('all');
  const [libraryEquipmentFilter, setLibraryEquipmentFilter] = useState('all');
  const [libraryDifficultyFilter, setLibraryDifficultyFilter] = useState('all');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('all');
  const [selectedLibraryExerciseId, setSelectedLibraryExerciseId] = useState(null);
  const [showExerciseBuilder, setShowExerciseBuilder] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseBuilderName, setExerciseBuilderName] = useState('');
  const [exerciseBuilderPrimary, setExerciseBuilderPrimary] = useState('Other');
  const [exerciseBuilderSecondary, setExerciseBuilderSecondary] = useState([]);
  const [exerciseBuilderEquipment, setExerciseBuilderEquipment] = useState('Other');
  const [exerciseBuilderDifficulty, setExerciseBuilderDifficulty] = useState('Beginner');
  const [exerciseBuilderType, setExerciseBuilderType] = useState('Weighted');
  const [exerciseBuilderCategory, setExerciseBuilderCategory] = useState('Custom');
  const [exerciseBuilderDescription, setExerciseBuilderDescription] = useState('');
  const [exerciseBuilderInstructions, setExerciseBuilderInstructions] = useState('');
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
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [generatorStep, setGeneratorStep] = useState(1);
  const [generatorGoal, setGeneratorGoal] = useState('balanced');
  const [generatorExperience, setGeneratorExperience] = useState('Intermediate');
  const [generatorFrequency, setGeneratorFrequency] = useState(3);
  const [generatorDuration, setGeneratorDuration] = useState(60);
  const [generatorEquipment, setGeneratorEquipment] = useState(['full-gym']);
  const [generatorCustomEquipment, setGeneratorCustomEquipment] = useState('');
  const [generatorMuscles, setGeneratorMuscles] = useState([]);
  const [generatorRestDays, setGeneratorRestDays] = useState(true);
  const [generatedDays, setGeneratedDays] = useState([]);
  const [generatorNotice, setGeneratorNotice] = useState('');

  useEffect(() => {
    const syncScreen = () => setActiveScreen(getScreenFromHash());
    window.addEventListener('hashchange', syncScreen);
    syncScreen();
    return () => window.removeEventListener('hashchange', syncScreen);
  }, []);

  useEffect(() => {
    if (!timerSession) return undefined;

    try {
      localStorage.setItem(
        TIMER_SESSION_KEY,
        JSON.stringify({
          ...timerSession,
          workoutName,
          exercises,
        })
      );
    } catch {
      console.error('Could not persist the active workout timer.');
    }

    return undefined;
  }, [timerSession, workoutName, exercises]);

  useEffect(() => {
    try {
      localStorage.setItem(TIMER_PREFERENCES_KEY, JSON.stringify(timerPreferences));
    } catch {
      console.error('Could not save timer preferences.');
    }
  }, [timerPreferences]);

  useEffect(() => {
    if (!timerSession || timerSession.status !== 'running') return undefined;
    const interval = window.setInterval(() => setTimerNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timerSession]);

  useEffect(() => {
    if (!restTimer || restTimer.status !== 'running') return undefined;
    const interval = window.setInterval(() => setRestNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [restTimer]);

  useEffect(() => {
    if (
      !restTimer ||
      restTimer.status !== 'running' ||
      getRestRemainingMs(restTimer, restNow) > 0 ||
      restCompletionRef.current
    ) {
      return;
    }

    restCompletionRef.current = true;
    setRestTimer(current => ({
      ...current,
      status: 'completed',
      remainingMs: 0,
    }));
    playRestCompletionSound(timerPreferences.soundEnabled);
    setNotice('Rest complete. Ready for the next set.');
  }, [restTimer, restNow, timerPreferences.soundEnabled]);


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

  const allLibraryExercises = [...BUILT_IN_EXERCISES, ...customExercises].map(exercise => ({
    image: null,
    ...exercise,
  }));
  const libraryCategories = [...new Set(allLibraryExercises.map(exercise => exercise.category))].sort();
  const libraryExerciseNames = allLibraryExercises.map(exercise => exercise.name);
  const selectedLibraryExercise = allLibraryExercises.find(
    exercise => exercise.id === selectedLibraryExerciseId
  ) || null;
  const filteredLibraryExercises = allLibraryExercises.filter(exercise => {
    const query = librarySearch.trim().toLowerCase();
    return (!query ||
      exercise.name.toLowerCase().includes(query) ||
      exercise.description.toLowerCase().includes(query) ||
      exercise.primaryMuscle.toLowerCase().includes(query)) &&
      (libraryMuscleFilter === 'all' || exercise.primaryMuscle === libraryMuscleFilter) &&
      (libraryEquipmentFilter === 'all' || exercise.equipment === libraryEquipmentFilter) &&
      (libraryDifficultyFilter === 'all' || exercise.difficulty === libraryDifficultyFilter) &&
      (libraryCategoryFilter === 'all' || exercise.category === libraryCategoryFilter);
  });
  const selectedLibraryHistory = selectedLibraryExercise
    ? realWorkouts.flatMap(workout =>
        (workout.exercises || [])
          .filter(exercise =>
            normalizeExerciseName(exercise.name).toLowerCase() ===
            selectedLibraryExercise.name.toLowerCase()
          )
          .map(exercise => ({
            date: workout.date,
            workoutName: workout.name,
            ...getExerciseMetrics(exercise),
          }))
      ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    : [];
  const suggestedLibraryExercises = allLibraryExercises.filter(exercise => {
    const usedInPlans = plans.some(plan =>
      plan.days.some(day => day.exercises.some(name =>
        normalizeExerciseName(name).toLowerCase() === exercise.name.toLowerCase()
      ))
    );
    const recent = recentExercises.includes(exercise.name);
    return recent || usedInPlans ||
      (selectedLibraryExercise && exercise.primaryMuscle === selectedLibraryExercise.primaryMuscle);
  }).slice(0, 5);

  const allFoods = [...BUILT_IN_FOODS, ...customFoods];
  const filteredNutritionFoods = allFoods.filter(food => {
    const query = nutritionFoodSearch.trim().toLowerCase();
    return (!query || food.name.toLowerCase().includes(query) || food.category.toLowerCase().includes(query)) &&
      (nutritionFoodCategory === 'all' || food.category === nutritionFoodCategory);
  });
  const nutritionLog = nutritionLogs.find(log => log.date === nutritionDate) || {
    date: nutritionDate,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    notes: {},
  };
  const nutritionMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const nutritionMealTotals = nutritionEntryTotals(
    nutritionMeals.flatMap(meal => nutritionLog.meals?.[meal] || [])
  );
  const nutritionRangeStart = getRangeStart(nutritionHistoryRange, nutritionDate);
  const nutritionHistory = nutritionLogs
    .filter(log => !nutritionRangeStart || log.date >= nutritionRangeStart)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nutritionHistoryTotals = nutritionHistory.map(log => ({
    ...log,
    totals: nutritionEntryTotals(nutritionMeals.flatMap(meal => log.meals?.[meal] || [])),
  }));
  const nutritionAverageCalories = nutritionHistoryTotals.length
    ? nutritionHistoryTotals.reduce((total, log) => total + log.totals.calories, 0) / nutritionHistoryTotals.length
    : 0;
  const nutritionSelectedFood = allFoods.find(food => food.id === nutritionSelectedFoodId) || null;

  const currentStreak = calculateStreak(realWorkouts);
  const activeTimerElapsed = getElapsedTimerMs(timerSession, timerNow);
  const restRemainingMs = getRestRemainingMs(restTimer, restNow);
  const restProgress = restTimer
    ? Math.max(0, Math.min(100, (restRemainingMs / restTimer.durationMs) * 100))
    : 0;

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
  const nutritionBodyEntries = filteredBodyEntries.filter(entry =>
    nutritionHistory.some(log => log.date === entry.date)
  ).sort((a, b) => a.date.localeCompare(b.date));

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

  const selectedLibraryRecord = selectedLibraryExercise
    ? personalRecords.find(record =>
        record.name.toLowerCase() === selectedLibraryExercise.name.toLowerCase()
      )
    : null;

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

  function logPlanDay(day) {
    openLogger();
    setWorkoutName(day.name);
    setExercises(
      day.exercises.length
        ? day.exercises.map(name => ({
            ...emptyExercise(),
            name: normalizeExerciseName(name),
          }))
        : [emptyExercise()]
    );
    day.exercises.forEach(name => rememberExercise(name));
  }

  function getGeneratorRepConfig() {
    if (generatorGoal === 'strength') {
      return { sets: generatorExperience === 'Beginner' ? 3 : 4, reps: '4-6', restSeconds: 150 };
    }
    if (generatorGoal === 'hypertrophy') {
      return { sets: generatorExperience === 'Beginner' ? 3 : 4, reps: '8-12', restSeconds: 90 };
    }
    if (generatorGoal === 'endurance') {
      return { sets: 2, reps: '12-20', restSeconds: 45 };
    }
    return { sets: 3, reps: '8-12', restSeconds: 75 };
  }

  function equipmentMatchesExercise(exercise) {
    if (generatorEquipment.includes('full-gym')) return true;
    if (generatorEquipment.includes('custom')) {
      const available = generatorCustomEquipment
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
      if (available.includes(exercise.equipment.toLowerCase())) return true;
    }
    return generatorEquipment.includes(exercise.equipment) ||
      (exercise.equipment === 'Smith Machine' && generatorEquipment.includes('Barbell'));
  }

  function generateWorkoutPlan() {
    const frequency = Number(generatorFrequency);
    const selectedMuscles = generatorMuscles.length ? generatorMuscles : GENERATOR_MUSCLES;
    const splitNames = frequency === 2
      ? ['Full Body A', 'Full Body B']
      : frequency === 3 && generatorExperience === 'Beginner'
        ? ['Full Body A', 'Full Body B', 'Full Body C']
        : frequency === 3
          ? ['Push', 'Pull', 'Legs']
          : frequency === 4
            ? ['Upper A', 'Lower A', 'Upper B', 'Lower B']
            : frequency === 5
              ? ['Upper', 'Lower', 'Push', 'Pull', 'Legs']
              : ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
    const repConfig = getGeneratorRepConfig();
    const usedExercises = new Set();
    const difficultyRank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    const maxDifficulty = difficultyRank[generatorExperience];
    const dayMuscles = splitNames.map((name, index) => {
      if (name.toLowerCase().includes('push')) return ['Chest', 'Shoulders', 'Triceps'].filter(item => selectedMuscles.includes(item));
      if (name.toLowerCase().includes('pull')) return ['Back', 'Biceps', 'Forearms'].filter(item => selectedMuscles.includes(item));
      if (name.toLowerCase().includes('leg')) return ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'].filter(item => selectedMuscles.includes(item));
      if (name.toLowerCase().includes('upper')) return ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'].filter(item => selectedMuscles.includes(item));
      if (name.toLowerCase().includes('lower')) return ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'].filter(item => selectedMuscles.includes(item));
      return selectedMuscles.filter((_, muscleIndex) =>
        muscleIndex % frequency === index % frequency || frequency <= 3
      );
    });

    const desiredExercises = generatorDuration <= 30 ? 3 : generatorDuration <= 45 ? 4 : 5;
    const days = splitNames.map((name, index) => {
      const targets = dayMuscles[index].length ? dayMuscles[index] : selectedMuscles;
      const candidates = allLibraryExercises
        .filter(exercise => equipmentMatchesExercise(exercise))
        .filter(exercise => difficultyRank[exercise.difficulty] <= maxDifficulty)
        .map(exercise => {
          const targetScore = targets.includes(exercise.primaryMuscle) ? 5 : 0;
          const secondaryScore = (exercise.secondaryMuscles || []).some(item => targets.includes(item)) ? 2 : 0;
          const recentPenalty = recentExercises.some(item => item.toLowerCase() === exercise.name.toLowerCase()) ? 1 : 0;
          const usedPenalty = usedExercises.has(exercise.name.toLowerCase()) ? 4 : 0;
          const compoundBonus = exercise.category === 'Strength' ? 1 : 0;
          return { exercise, score: targetScore + secondaryScore + compoundBonus - recentPenalty - usedPenalty };
        })
        .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));
      const selected = [];
      candidates.forEach(item => {
        if (selected.length >= desiredExercises) return;
        const key = item.exercise.name.toLowerCase();
        if (selected.some(exercise => exercise.name.toLowerCase() === key)) return;
        selected.push(item.exercise);
        usedExercises.add(key);
      });

      return {
        id: crypto.randomUUID(),
        name,
        targetMuscles: targets,
        restAfter: generatorRestDays && index < splitNames.length - 1 && (index + 1) % 2 === 0,
        estimatedMinutes: Math.min(generatorDuration, Math.max(20, selected.length * (generatorGoal === 'strength' ? 8 : 6))),
        completedDates: [],
        exercises: selected.map(exercise => ({
          id: crypto.randomUUID(),
          name: exercise.name,
          sets: repConfig.sets,
          reps: repConfig.reps,
          restSeconds: repConfig.restSeconds,
        })),
      };
    });

    const missing = days.filter(day => day.exercises.length < desiredExercises).length;
    setGeneratedDays(days);
    setGeneratorNotice(
      missing
        ? `The library has limited compatible exercises for ${missing} day${missing === 1 ? '' : 's'}; available alternatives were used.`
        : 'Suggested starting values are editable before saving.'
    );
    setGeneratorStep(3);
  }

  function updateGeneratedExercise(dayId, exerciseId, field, value) {
    setGeneratedDays(current => current.map(day =>
      day.id !== dayId ? day : {
        ...day,
        exercises: day.exercises.map(exercise =>
          exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
        ),
      }
    ));
  }

  function removeGeneratedExercise(dayId, exerciseId) {
    setGeneratedDays(current => current.map(day =>
      day.id !== dayId
        ? day
        : { ...day, exercises: day.exercises.filter(exercise => exercise.id !== exerciseId) }
    ));
  }

  function addGeneratedExercise(dayId, name) {
    const libraryExercise = allLibraryExercises.find(item => item.name === name);
    if (!libraryExercise) return;
    const repConfig = getGeneratorRepConfig();
    setGeneratedDays(current => current.map(day =>
      day.id !== dayId || day.exercises.some(exercise => exercise.name === name)
        ? day
        : {
            ...day,
            exercises: [...day.exercises, {
              id: crypto.randomUUID(),
              name,
              sets: repConfig.sets,
              reps: repConfig.reps,
              restSeconds: repConfig.restSeconds,
            }],
          }
    ));
  }

  function saveGeneratedPlan() {
    if (!generatedDays.length || generatedDays.some(day => !day.exercises.length)) {
      setGeneratorNotice('Each training day needs at least one library exercise.');
      return;
    }
    const plan = {
      id: crypto.randomUUID(),
      name: `${GENERATOR_GOALS.find(item => item.value === generatorGoal)?.label || 'Generated'} plan`,
      split: `${generatorFrequency}-day generated`,
      generated: true,
      generatorPreferences: {
        goal: generatorGoal,
        experience: generatorExperience,
        frequency: generatorFrequency,
        duration: generatorDuration,
        equipment: generatorEquipment,
        customEquipment: generatorCustomEquipment,
        muscles: generatorMuscles,
        restDays: generatorRestDays,
      },
      createdAt: new Date().toISOString(),
      days: generatedDays.map(day => ({
        id: day.id,
        name: day.name,
        exercises: day.exercises.map(exercise => exercise.name),
        suggestedExercises: day.exercises,
        targetMuscles: day.targetMuscles,
        completedDates: day.completedDates || [],
      })),
    };
    if (persistPlans([...plans, plan])) {
      setActivePlanId(plan.id);
      setShowPlanGenerator(false);
      setNotice('Generated workout plan saved.');
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

  function persistNutritionLogs(updated) {
      try {
        localStorage.setItem(NUTRITION_LOGS_KEY, JSON.stringify(updated));
        setNutritionLogs(updated);
        return true;
      } catch {
        setNotice('Could not save nutrition logs. Check your browser storage settings.');
        return false;
      }
    }

  function persistCustomFoods(updated) {
      try {
        localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
        setCustomFoods(updated);
        return true;
      } catch {
        setNotice('Could not save custom foods. Check your browser storage settings.');
        return false;
      }
    }

  function persistNutritionTargets(updated) {
      try {
        localStorage.setItem(NUTRITION_TARGETS_KEY, JSON.stringify(updated));
        setNutritionTargets(updated);
        return true;
      } catch {
        setNotice('Could not save nutrition targets. Check your browser storage settings.');
        return false;
      }
    }

  function updateNutritionLog(updater) {
      const existing = nutritionLogs.find(log => log.date === nutritionDate) || {
        id: crypto.randomUUID(),
        date: nutritionDate,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
        notes: {},
      };
      const updatedLog = updater({
        ...existing,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
          ...(existing.meals || {}),
        },
        notes: existing.notes || {},
      });
      const updated = nutritionLogs.some(log => log.date === nutritionDate)
        ? nutritionLogs.map(log => log.date === nutritionDate ? updatedLog : log)
        : [...nutritionLogs, updatedLog];
      persistNutritionLogs(updated.filter(log =>
        Object.values(log.meals || {}).some(entries => entries.length) ||
        Object.values(log.notes || {}).some(note => typeof note === 'string' && note.trim())
      ));
    }

  function addNutritionEntry(event) {
      event.preventDefault();
      if (!nutritionSelectedFood || Number(nutritionQuantity) <= 0) {
        setNotice('Select a food and enter a quantity greater than zero.');
        return;
      }
      const quantity = Number(nutritionQuantity);
      const nutrients = scaleFoodNutrition(nutritionSelectedFood, quantity);
      updateNutritionLog(log => ({
        ...log,
        meals: {
          ...log.meals,
          [nutritionMeal]: [...(log.meals[nutritionMeal] || []), {
            id: crypto.randomUUID(),
            foodId: nutritionSelectedFood.id,
            name: nutritionSelectedFood.name,
            servingSize: nutritionSelectedFood.servingSize,
            servingUnit: nutritionSelectedFood.servingUnit,
            quantity,
            nutrients,
            approximate: nutritionSelectedFood.approximate === true,
          }],
        },
      }));
      setNutritionQuantity('1');
      setNutritionSelectedFoodId('');
    }

  function deleteNutritionEntry(meal, entryId) {
      updateNutritionLog(log => ({
        ...log,
        meals: {
          ...log.meals,
          [meal]: (log.meals[meal] || []).filter(entry => entry.id !== entryId),
        },
      }));
    }

  function updateNutritionEntryQuantity(meal, entryId, quantity) {
      const numericQuantity = Number(quantity);
      if (!(numericQuantity > 0)) return;
      updateNutritionLog(log => ({
        ...log,
        meals: {
          ...log.meals,
          [meal]: (log.meals[meal] || []).map(entry =>
            entry.id !== entryId
              ? entry
              : {
                  ...entry,
                  quantity: numericQuantity,
                  nutrients: Object.fromEntries(
                    Object.entries(entry.nutrients).map(([key, value]) => [
                      key,
                      value === null || value === undefined
                        ? value
                        : (Number(value) / Number(entry.quantity || 1)) * numericQuantity,
                    ])
                  ),
                }
          ),
        },
      }));
    }

  function updateNutritionMealNote(meal, note) {
      updateNutritionLog(log => ({ ...log, notes: { ...log.notes, [meal]: note } }));
    }

  function resetFoodBuilder() {
      setEditingFoodId(null);
      setFoodBuilderName('');
      setFoodBuilderServingSize('100');
      setFoodBuilderServingUnit('g');
      setFoodBuilderCalories('');
      setFoodBuilderProtein('');
      setFoodBuilderCarbohydrates('');
      setFoodBuilderFat('');
      setFoodBuilderFibre('');
      setFoodBuilderSugar('');
      setFoodBuilderCategory('Other');
    }

  function openFoodBuilder(food = null) {
      if (food) {
        setEditingFoodId(food.id);
        setFoodBuilderName(food.name);
        setFoodBuilderServingSize(String(food.servingSize));
        setFoodBuilderServingUnit(food.servingUnit);
        setFoodBuilderCalories(String(food.calories));
        setFoodBuilderProtein(String(food.protein));
        setFoodBuilderCarbohydrates(String(food.carbohydrates));
        setFoodBuilderFat(String(food.fat));
        setFoodBuilderFibre(food.fibre === null ? '' : String(food.fibre));
        setFoodBuilderSugar(food.sugar === null ? '' : String(food.sugar));
        setFoodBuilderCategory(food.category);
      } else {
        resetFoodBuilder();
      }
      setShowFoodBuilder(true);
    }

  function saveCustomFood(event) {
      event.preventDefault();
      const values = [foodBuilderServingSize, foodBuilderCalories, foodBuilderProtein, foodBuilderCarbohydrates, foodBuilderFat];
      if (
        !foodBuilderName.trim() ||
        values.some(value => value === '' || Number(value) < 0) ||
        [foodBuilderFibre, foodBuilderSugar].some(value => value !== '' && Number(value) < 0) ||
        Number(foodBuilderServingSize) <= 0
      ) {
        setNotice('Enter a food name and valid non-negative nutrition values.');
        return;
      }
      const food = {
        id: editingFoodId || crypto.randomUUID(),
        name: normalizeExerciseName(foodBuilderName),
        servingSize: Number(foodBuilderServingSize),
        servingUnit: foodBuilderServingUnit.trim() || 'serving',
        calories: Number(foodBuilderCalories),
        protein: Number(foodBuilderProtein),
        carbohydrates: Number(foodBuilderCarbohydrates),
        fat: Number(foodBuilderFat),
        fibre: foodBuilderFibre === '' ? null : Number(foodBuilderFibre),
        sugar: foodBuilderSugar === '' ? null : Number(foodBuilderSugar),
        category: foodBuilderCategory,
        custom: true,
      };
      const updated = editingFoodId
        ? customFoods.map(item => item.id === editingFoodId ? food : item)
        : [...customFoods, food];
      if (persistCustomFoods(updated)) {
        setShowFoodBuilder(false);
        resetFoodBuilder();
        setNotice(editingFoodId ? 'Custom food updated.' : 'Custom food added.');
      }
    }

  function deleteCustomFood(food) {
      if (!window.confirm(`Delete "${food.name}" from your custom foods? Historical meal snapshots will remain unchanged.`)) return;
      persistCustomFoods(customFoods.filter(item => item.id !== food.id));
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

  function persistCustomExercises(updated) {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
      setCustomExercises(updated);
      return true;
    } catch {
      setNotice('Could not save custom exercises. Check browser storage.');
      return false;
    }
  }

  function persistExerciseList(key, updated, setter, message) {
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      setter(updated);
    } catch {
      setNotice(message);
    }
  }

  function toggleFavoriteExercise(name) {
    const normalized = normalizeExerciseName(name);
    const updated = favoriteExercises.includes(normalized)
      ? favoriteExercises.filter(item => item !== normalized)
      : [...favoriteExercises, normalized];
    persistExerciseList(
      FAVORITE_EXERCISES_KEY,
      updated,
      setFavoriteExercises,
      'Could not update favorites. Check browser storage.'
    );
  }

  function rememberExercise(name) {
    const normalized = normalizeExerciseName(name);
    if (!normalized) return;
    const updated = [
      normalized,
      ...recentExercises.filter(item => item.toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, 12);
    persistExerciseList(
      RECENT_EXERCISES_KEY,
      updated,
      setRecentExercises,
      'Could not update recent exercises. Check browser storage.'
    );
  }

  function openExerciseBuilder(exercise = null) {
    setEditingExerciseId(exercise?.id || null);
    setExerciseBuilderName(exercise?.name || '');
    setExerciseBuilderPrimary(exercise?.primaryMuscle || 'Other');
    setExerciseBuilderSecondary(exercise?.secondaryMuscles || []);
    setExerciseBuilderEquipment(exercise?.equipment || 'Other');
    setExerciseBuilderDifficulty(exercise?.difficulty || 'Beginner');
    setExerciseBuilderType(exercise?.type || 'Weighted');
    setExerciseBuilderCategory(exercise?.category || 'Custom');
    setExerciseBuilderDescription(exercise?.description || '');
    setExerciseBuilderInstructions((exercise?.instructions || []).join('\n'));
    setNotice('');
    setShowExerciseBuilder(true);
  }

  function saveCustomExercise(event) {
    event.preventDefault();
    const name = normalizeExerciseName(exerciseBuilderName);
    if (!name) {
      setNotice('Enter an exercise name.');
      return;
    }

    const duplicate = allLibraryExercises.find(exercise =>
      exercise.id !== editingExerciseId &&
      exercise.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setNotice('An exercise with that name already exists.');
      return;
    }

    const existing = customExercises.find(exercise => exercise.id === editingExerciseId);
    const exercise = {
      id: existing?.id || `custom-${crypto.randomUUID()}`,
      name,
      primaryMuscle: exerciseBuilderPrimary,
      secondaryMuscles: exerciseBuilderSecondary,
      equipment: exerciseBuilderEquipment,
      difficulty: exerciseBuilderDifficulty,
      type: exerciseBuilderType,
      category: exerciseBuilderCategory.trim() || 'Custom',
      description: exerciseBuilderDescription.trim() || 'Custom exercise saved in your library.',
      instructions: exerciseBuilderInstructions.split('\n').map(item => item.trim()).filter(Boolean),
      tips: [],
      mistakes: [],
      custom: true,
    };
    const updated = existing
      ? customExercises.map(item => item.id === existing.id ? exercise : item)
      : [exercise, ...customExercises];

    if (persistCustomExercises(updated)) {
      setSelectedLibraryExerciseId(exercise.id);
      setShowExerciseBuilder(false);
    }
  }

  function deleteCustomExercise(exercise) {
    if (!exercise.custom || !window.confirm(`Delete "${exercise.name}" from your library? Historical workouts will remain readable.`)) return;
    persistCustomExercises(customExercises.filter(item => item.id !== exercise.id));
    if (selectedLibraryExerciseId === exercise.id) setSelectedLibraryExerciseId(null);
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
        version: 3,
        exportedAt: new Date().toISOString(),
        workouts: realWorkouts,
        goals,
        goalNotifications,
        muscleOverrides,
        bodyEntries,
        customExercises,
        favoriteExercises,
        recentExercises,
        customFoods,
        nutritionLogs,
        nutritionTargets,
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
      const importedCustomExercises = Array.isArray(parsed) ? null : parsed.customExercises;
      const importedFavorites = Array.isArray(parsed) ? null : parsed.favoriteExercises;
      const importedRecent = Array.isArray(parsed) ? null : parsed.recentExercises;
      const importedCustomFoods = Array.isArray(parsed) ? null : parsed.customFoods;
      const importedNutritionLogs = Array.isArray(parsed) ? null : parsed.nutritionLogs;
      const importedNutritionTargets = Array.isArray(parsed) ? null : parsed.nutritionTargets;

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
        if (Array.isArray(importedCustomExercises)) {
          persistCustomExercises(importedCustomExercises);
        }
        if (Array.isArray(importedFavorites)) {
          persistExerciseList(
            FAVORITE_EXERCISES_KEY,
            importedFavorites,
            setFavoriteExercises,
            'Could not import exercise favorites.'
          );
        }
        if (Array.isArray(importedRecent)) {
          persistExerciseList(
            RECENT_EXERCISES_KEY,
            importedRecent,
            setRecentExercises,
            'Could not import recent exercises.'
          );
        }
        if (Array.isArray(importedCustomFoods)) {
          persistCustomFoods(importedCustomFoods);
        }
        if (Array.isArray(importedNutritionLogs)) {
          persistNutritionLogs(importedNutritionLogs);
        }
        if (importedNutritionTargets && typeof importedNutritionTargets === 'object') {
          persistNutritionTargets({
            ...DEFAULT_NUTRITION_TARGETS,
            ...importedNutritionTargets,
          });
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

  function clearTimerSession() {
    setTimerSession(null);
    try {
      localStorage.removeItem(TIMER_SESSION_KEY);
    } catch {
      setNotice('Could not clear the active workout timer.');
    }
  }

  function startWorkoutTimer() {
    if (editingWorkoutId) {
      setNotice('Start timing from a new workout, not an existing workout edit.');
      return;
    }

    const now = Date.now();
    if (timerSession?.status === 'paused') {
      setTimerSession(current => ({
        ...current,
        status: 'running',
        startedAt: now,
        pausedAt: null,
      }));
      return;
    }

    if (timerSession?.status === 'running') return;

    setTimerSession({
      status: 'running',
      startedAt: now,
      accumulatedMs: 0,
      pausedAt: null,
      workoutName,
      exercises,
    });
    setTimerNow(now);
    setNotice('Workout timer started.');
  }

  function pauseWorkoutTimer() {
    if (!timerSession || timerSession.status !== 'running') return;
    const now = Date.now();
    setTimerSession(current => ({
      ...current,
      status: 'paused',
      pausedAt: now,
    }));
    setTimerNow(now);
  }

  function resumeWorkoutTimer() {
    if (!timerSession || timerSession.status !== 'paused') return;
    const now = Date.now();
    setTimerSession(current => ({
      ...current,
      status: 'running',
      startedAt: now,
      accumulatedMs: current.accumulatedMs + Math.max(0, now - (current.pausedAt || now)),
      pausedAt: null,
    }));
    setTimerNow(now);
  }

  function finishWorkoutTimer() {
    if (!timerSession) return;
    const elapsedMs = getElapsedTimerMs(timerSession, Date.now());
    const elapsedMinutes = Math.max(1, Math.ceil(elapsedMs / 60000));
    setDuration(String(elapsedMinutes));
    clearTimerSession();
    setNotice(`Workout timed at ${formatWorkoutTime(elapsedMs)}. Review it before saving.`);
  }

  function cancelWorkoutTimer() {
    if (!timerSession) {
      setShowLogger(false);
      setEditingWorkoutId(null);
      return;
    }

    if (!window.confirm('Cancel this active workout? It will not be saved.')) return;
    clearTimerSession();
    setShowLogger(false);
    setEditingWorkoutId(null);
    setNotice('');
  }

  function startRestTimer(seconds = timerPreferences.defaultRestSeconds) {
    const durationMs = Math.max(1, Number(seconds) || timerPreferences.defaultRestSeconds) * 1000;
    const now = Date.now();
    restCompletionRef.current = false;
    setRestTimer({
      status: 'running',
      durationMs,
      remainingMs: durationMs,
      endsAt: now + durationMs,
    });
    setRestNow(now);
  }

  function pauseRestTimer() {
    if (!restTimer || restTimer.status !== 'running') return;
    const remainingMs = getRestRemainingMs(restTimer, Date.now());
    setRestTimer(current => ({ ...current, status: 'paused', remainingMs }));
  }

  function resumeRestTimer() {
    if (!restTimer || restTimer.status !== 'paused' || restTimer.remainingMs <= 0) return;
    const now = Date.now();
    setRestTimer(current => ({
      ...current,
      status: 'running',
      endsAt: now + current.remainingMs,
    }));
    setRestNow(now);
  }

  function resetRestTimer() {
    restCompletionRef.current = false;
    setRestTimer(null);
  }

  function skipRestTimer() {
    resetRestTimer();
    setNotice('Rest skipped. Ready for the next set.');
  }

  function completeExerciseSet(exerciseName) {
    if (timerPreferences.autoRestPrompt) {
      startRestTimer();
      setNotice(`Set complete for ${exerciseName || 'this exercise'}. Rest timer started.`);
      return;
    }

    setNotice(`Set complete for ${exerciseName || 'this exercise'}. Start rest when ready.`);
  }

  function openLogger() {
    setActiveScreen('workouts');
    if (timerSession) {
      setShowLogger(true);
      return;
    }
    setEditingWorkoutId(null);
    setWorkoutName('');
    setDuration('45');
    setExercises([emptyExercise()]);
    setNotice('');
    setShowLogger(true);
  }

  function openEditLogger(workout) {
    setActiveScreen('workouts');
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

    if (timerSession) {
      setNotice('Finish the active workout timer before saving the session.');
      return;
    }

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
      const newlyUsed = validExercises.map(exercise => normalizeExerciseName(exercise.name));
      const updatedRecent = [
        ...newlyUsed.reverse(),
        ...recentExercises.filter(item =>
          !newlyUsed.some(name => name.toLowerCase() === item.toLowerCase())
        ),
      ].slice(0, 12);
      persistExerciseList(
        RECENT_EXERCISES_KEY,
        updatedRecent,
        setRecentExercises,
        'Could not update recent exercises.'
      );
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
      {showAdvancedFeatures && activeGoalNotifications.length > 0 && (
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
          <a className={activeScreen === 'dashboard' ? 'nav-item active' : 'nav-item'} href="#overview">Dashboard</a>
          <a className={activeScreen === 'workouts' ? 'nav-item active' : 'nav-item'} href="#workout-logger" onClick={openLogger}>Workouts</a>
          <a className={activeScreen === 'history' ? 'nav-item active' : 'nav-item'} href="#history">History</a>
          <a className={activeScreen === 'plans' ? 'nav-item active' : 'nav-item'} href="#plans">Plans</a>
          <a className={activeScreen === 'progress' ? 'nav-item active' : 'nav-item'} href="#progress">Progress</a>
          <a className={activeScreen === 'personal-records' ? 'nav-item active' : 'nav-item'} href="#personal-records">Personal records</a>
          <a className="nav-item" href="#settings">Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>LOCAL STORAGE ACTIVE</span>
          </div>
          <div className="sidebar-caption">YOUR TRAINING. YOUR DATA.</div>
        </div>
      </aside>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          ['overview', 'Home'],
          ['workout-logger', 'Workouts'],
          ['history', 'History'],
          ['progress', 'Progress'],
        ].map(([href, label]) => {
          const screen = href === 'overview' ? 'dashboard' : href === 'workout-logger' ? 'workouts' : href;
          return <a className={activeScreen === screen ? 'active' : ''} href={`#${href}`} onClick={href === 'workout-logger' ? openLogger : undefined} key={href}><span>{label === 'Home' ? '⌂' : label === 'Workouts' ? '+' : label === 'History' ? '▤' : '↗'}</span>{label}</a>;
        })}
      </nav>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">PERSONAL TRAINING DASHBOARD</div>
            <h1>{activeScreen === 'dashboard' ? 'Ready for today?' : activeScreen === 'workouts' ? 'Your workout' : activeScreen === 'history' ? 'Workout history' : activeScreen === 'plans' ? 'Workout plans' : activeScreen === 'progress' ? 'Progress overview' : 'Personal records'}</h1>
            <p className="page-subtitle">{activeScreen === 'dashboard' ? 'Track your work. Build consistency.' : 'Keep your training simple, consistent, and visible.'}</p>
          </div>

          <button className="primary-button" onClick={openLogger}>
            + Log workout
          </button>
        </header>

        {activeScreen === 'workouts' && !showLogger && (
          <section className="workout-screen-empty panel">
            <div className="eyebrow">WORKOUTS</div>
            <h2>Ready for today's workout?</h2>
            <p>Start a session, choose your exercises, and record the work you complete.</p>
            <button className="primary-button" onClick={openLogger}>Start workout</button>
          </section>
        )}

        {showAdvancedFeatures && timerSession && (
          <section className={`active-workout-panel ${timerSession.status}`} aria-live="polite">
            <div className="active-workout-main">
              <div className="eyebrow">
                {timerSession.status === 'paused' ? 'WORKOUT PAUSED' : 'ACTIVE WORKOUT'}
              </div>
              <h2>{workoutName || 'Untitled workout'}</h2>
              <strong className="workout-timer-digits">
                {formatWorkoutTime(activeTimerElapsed)}
              </strong>
              <span className="timer-caption">Elapsed time · paused time excluded</span>
            </div>
            <div className="active-workout-actions">
              {timerSession.status === 'running' ? (
                <button className="secondary-button" onClick={pauseWorkoutTimer}>Pause</button>
              ) : (
                <button className="secondary-button" onClick={resumeWorkoutTimer}>Resume</button>
              )}
              <button className="primary-button" onClick={finishWorkoutTimer}>Finish workout</button>
              <button className="clear-button" onClick={cancelWorkoutTimer}>Cancel</button>
            </div>
            <div className="active-rest-controls">
              <div>
                <span className="timer-control-label">REST TIMER</span>
                <strong>{restTimer ? formatRestTime(restRemainingMs) : 'Ready'}</strong>
              </div>
              <select
                value={restPreset}
                onChange={event => setRestPreset(event.target.value)}
                aria-label="Rest duration"
              >
                <option value="30">30 sec</option>
                <option value="45">45 sec</option>
                <option value="60">60 sec</option>
                <option value="90">90 sec</option>
                <option value="120">120 sec</option>
                <option value="custom">Custom</option>
              </select>
              {restPreset === 'custom' && (
                <input
                  type="number"
                  min="1"
                  value={customRestSeconds}
                  onChange={event => setCustomRestSeconds(event.target.value)}
                  aria-label="Custom rest duration seconds"
                />
              )}
              {!restTimer && (
                <button
                  className="secondary-button"
                  onClick={() => startRestTimer(restPreset === 'custom' ? customRestSeconds : restPreset)}
                >
                  Start rest
                </button>
              )}
              {restTimer?.status === 'running' && (
                <button className="secondary-button" onClick={pauseRestTimer}>Pause rest</button>
              )}
              {restTimer?.status === 'paused' && restRemainingMs > 0 && (
                <button className="secondary-button" onClick={resumeRestTimer}>Resume rest</button>
              )}
              {restTimer && (
                <>
                  <button className="clear-button" onClick={skipRestTimer}>Skip</button>
                  <button className="clear-button" onClick={resetRestTimer}>Reset</button>
                </>
              )}
              {restTimer && (
                <div className="rest-progress-track" aria-label="Rest timer progress">
                  <span style={{ width: `${restProgress}%` }} />
                </div>
              )}
              {restTimer &&
                timerPreferences.warningSeconds > 0 &&
                restRemainingMs > 0 &&
                restRemainingMs <= timerPreferences.warningSeconds * 1000 && (
                  <span className="rest-warning">Rest ending soon</span>
                )}
            </div>
          </section>
        )}

        {activeScreen === 'dashboard' && <section className="stats-grid" id="overview">
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
        </section>}

        {showAdvancedFeatures && <section className="panel body-overview-card">
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
        </section>}

        {showAdvancedFeatures && <section className="panel nutrition-overview-card">
          <div>
            <div className="eyebrow">TODAY'S NUTRITION</div>
            <h2>Fuel snapshot</h2>
            <p className="history-subtitle">
              {nutritionMealTotals.calories.toFixed(0)} kcal logged · {Math.max(0, nutritionTargets.calories - nutritionMealTotals.calories).toFixed(0)} kcal remaining
            </p>
          </div>
          <div className="nutrition-overview-metrics">
            <div><span>CALORIES</span><strong>{nutritionMealTotals.calories.toFixed(0)} / {nutritionTargets.calories}</strong></div>
            <div><span>PROTEIN</span><strong>{nutritionMealTotals.protein.toFixed(0)}g / {nutritionTargets.protein}g</strong></div>
          </div>
          <a className="secondary-button" href="#nutrition">Open nutrition ↗</a>
        </section>}

        {activeScreen === 'dashboard' && <section className="content-grid" id="dashboard-progress">
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
        </section>}

        {activeScreen === 'dashboard' && (
          <section className="workspace-grid" aria-label="Workout workspace">
            {[
              ['history', 'History', 'Review your saved sessions and backups.'],
              ['plans', 'Workout plans', 'Build a simple routine for your week.'],
              ['progress', 'Progress', 'See exercise trends and comparisons.'],
              ['personal-records', 'Personal records', 'Celebrate your strongest performances.'],
            ].map(([href, title, description]) => (
              <a className="workspace-card" href={`#${href}`} key={href}>
                <span className="workspace-card-arrow">↗</span>
                <strong>{title}</strong>
                <span>{description}</span>
              </a>
            ))}
          </section>
        )}

        {/* WORKOUT INSIGHTS */}
        {showAdvancedFeatures && (<section className="panel insights-panel" id="insights">
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
        </section>)}

        {showAdvancedFeatures && (<section className="panel nutrition-panel" id="nutrition">
          <div className="history-heading">
            <div>
              <div className="eyebrow">FOOD & FUEL</div>
              <h2>Nutrition</h2>
              <p className="history-subtitle">Log meals with dated nutritional snapshots. Targets are configurable starting points, not medical recommendations.</p>
            </div>
            <div className="nutrition-date-control">
              <label>DATE <input type="date" value={nutritionDate} onChange={event => setNutritionDate(event.target.value)} /></label>
              <button className="secondary-button" onClick={() => openFoodBuilder()}>+ Custom food</button>
            </div>
          </div>

          <div className="nutrition-stat-grid">
            {[
              ['Calories', nutritionMealTotals.calories, nutritionTargets.calories, 'kcal'],
              ['Protein', nutritionMealTotals.protein, nutritionTargets.protein, 'g'],
              ['Carbohydrates', nutritionMealTotals.carbohydrates, nutritionTargets.carbohydrates, 'g'],
              ['Fat', nutritionMealTotals.fat, nutritionTargets.fat, 'g'],
            ].map(([label, value, target, unit]) => (
              <article className="nutrition-stat-card" key={label}>
                <span>{label.toUpperCase()}</span>
                <strong>{value.toFixed(0)}<small> / {target}{unit}</small></strong>
                <div className="nutrition-progress"><span style={{ width: `${Math.min(100, (value / target) * 100)}%` }} /></div>
                <em>{Math.round((value / target) * 100)}% of target</em>
              </article>
            ))}
          </div>

          <div className="nutrition-layout">
            <div className="nutrition-logger">
              <div className="nutrition-section-heading">
                <div><span className="eyebrow">ADD FOOD</span><h3>Meal logger</h3></div>
                <select value={nutritionMeal} onChange={event => setNutritionMeal(event.target.value)} aria-label="Meal">
                  {nutritionMeals.map(meal => <option key={meal} value={meal}>{meal[0].toUpperCase() + meal.slice(1)}</option>)}
                </select>
              </div>
              <form className="nutrition-food-form" onSubmit={addNutritionEntry}>
                <input type="search" value={nutritionFoodSearch} onChange={event => setNutritionFoodSearch(event.target.value)} placeholder="Search foods..." aria-label="Search foods" />
                <select value={nutritionFoodCategory} onChange={event => setNutritionFoodCategory(event.target.value)} aria-label="Food category">
                  <option value="all">All categories</option>
                  {FOOD_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
                <select value={nutritionSelectedFoodId} onChange={event => setNutritionSelectedFoodId(event.target.value)} aria-label="Food">
                  <option value="">Select food</option>
                  {filteredNutritionFoods.map(food => <option key={food.id} value={food.id}>{food.name}{food.approximate ? ' · approx.' : ''}</option>)}
                </select>
                <input type="number" min="0.01" step="0.01" value={nutritionQuantity} onChange={event => setNutritionQuantity(event.target.value)} aria-label="Serving quantity" />
                <button className="primary-button" type="submit">Add to {nutritionMeal}</button>
              </form>
              <p className="nutrition-footnote">Built-in foods use approximate estimates per listed serving. Custom foods use the values you enter.</p>
              {nutritionSelectedFood && <p className="nutrition-selection-detail">{nutritionSelectedFood.servingSize}{nutritionSelectedFood.servingUnit} · {nutritionSelectedFood.calories} kcal · {nutritionSelectedFood.protein}g protein per serving</p>}
              <div className="meal-list">
                {nutritionMeals.map(meal => (
                  <article className="meal-card" key={meal}>
                    <div className="meal-card-heading"><h3>{meal[0].toUpperCase() + meal.slice(1)}</h3><span>{nutritionLog.meals?.[meal]?.length || 0} items</span></div>
                    {(nutritionLog.meals?.[meal] || []).length ? (nutritionLog.meals[meal] || []).map(entry => (
                      <div className="meal-entry" key={entry.id}>
                        <div><strong>{entry.name}</strong><small>{entry.approximate ? 'Approximate estimate · ' : ''}{entry.quantity} × {entry.servingSize}{entry.servingUnit} · {entry.nutrients.calories.toFixed(0)} kcal</small></div>
                        <input type="number" min="0.01" step="0.01" value={entry.quantity} onChange={event => updateNutritionEntryQuantity(meal, entry.id, event.target.value)} aria-label={`${entry.name} quantity`} />
                        <span>{entry.servingUnit}</span>
                        <button className="clear-button" type="button" onClick={() => deleteNutritionEntry(meal, entry.id)} aria-label={`Delete ${entry.name}`}>×</button>
                      </div>
                    )) : <p className="nutrition-empty">No foods logged.</p>}
                    <input className="meal-note-input" value={nutritionLog.notes?.[meal] || ''} onChange={event => updateNutritionMealNote(meal, event.target.value)} placeholder="Add a meal note..." aria-label={`${meal} note`} />
                  </article>
                ))}
              </div>
            </div>
            <aside className="nutrition-targets-card">
              <div className="nutrition-section-heading"><div><span className="eyebrow">DAILY TARGETS</span><h3>Configure goals</h3></div></div>
              {Object.entries(nutritionTargets).map(([key, value]) => (
                <label key={key}>{key[0].toUpperCase() + key.slice(1)}
                  <input type="number" min="1" value={value} onChange={event => {
                    const next = Number(event.target.value);
                    if (next > 0) persistNutritionTargets({ ...nutritionTargets, [key]: next });
                  }} />
                </label>
              ))}
              <p>These are user-configurable tracking targets and are not personalized dietary advice.</p>
            </aside>
          </div>

          <div className="nutrition-history">
            <div className="nutrition-section-heading">
              <div><span className="eyebrow">HISTORY & TRENDS</span><h3>Nutrition analytics</h3></div>
              <select value={nutritionHistoryRange} onChange={event => setNutritionHistoryRange(event.target.value)} aria-label="Nutrition history range">
                <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option>
              </select>
            </div>
            <div className="nutrition-history-summary"><strong>{nutritionAverageCalories.toFixed(0)} kcal</strong><span>average logged calories · {nutritionHistoryTotals.length} logged day{nutritionHistoryTotals.length === 1 ? '' : 's'}</span></div>
            {nutritionHistoryTotals.length > 0 && (
              <div className="nutrition-trend-chart" aria-label="Daily calorie intake trend">
                {nutritionHistoryTotals.map(log => (
                  <div className="nutrition-trend-column" key={`${log.date}-chart`} title={`${log.date}: ${log.totals.calories.toFixed(0)} kcal`}>
                    <span style={{ height: `${Math.max(8, (log.totals.calories / Math.max(nutritionTargets.calories, ...nutritionHistoryTotals.map(item => item.totals.calories))) * 100)}%` }} />
                    <small>{log.date.slice(5)}</small>
                  </div>
                ))}
              </div>
            )}
            {nutritionHistoryTotals.length ? (
              <div className="nutrition-history-list">
                {nutritionHistoryTotals.slice().reverse().map(log => (
                  <div className="nutrition-history-row" key={log.date}>
                    <strong>{log.date}</strong><span>{log.totals.calories.toFixed(0)} kcal</span><span>{log.totals.protein.toFixed(0)}g protein</span><span>{log.totals.carbohydrates.toFixed(0)}g carbs</span><span>{log.totals.fat.toFixed(0)}g fat</span><span>{Math.round((log.totals.calories / nutritionTargets.calories) * 100)}% target</span>
                  </div>
                ))}
              </div>
            ) : <div className="nutrition-empty">Log meals to build your nutrition history.</div>}
            <div className="nutrition-body-link">
              <span>Body weight entries and nutrition intake are shown as separate trends.</span>
              <a className="secondary-button" href="#body-tracker">Compare in body tracker ↗</a>
            </div>
            {nutritionBodyEntries.length > 0 && <div className="nutrition-body-trend">{nutritionBodyEntries.map(entry => <span key={entry.id}>{entry.date}: {entry.weightKg.toFixed(1)} kg</span>)}</div>}
          </div>

          {showFoodBuilder && (
            <div className="nutrition-food-builder">
              <div className="nutrition-section-heading"><div><span className="eyebrow">CUSTOM FOOD</span><h3>{editingFoodId ? 'Edit custom food' : 'Add custom food'}</h3></div><button className="clear-button" type="button" onClick={() => setShowFoodBuilder(false)}>×</button></div>
              <form className="food-builder-grid" onSubmit={saveCustomFood}>
                <input required value={foodBuilderName} onChange={event => setFoodBuilderName(event.target.value)} placeholder="Food name" />
                <input required type="number" min="0.01" step="0.01" value={foodBuilderServingSize} onChange={event => setFoodBuilderServingSize(event.target.value)} placeholder="Serving quantity" />
                <input required value={foodBuilderServingUnit} onChange={event => setFoodBuilderServingUnit(event.target.value)} placeholder="Unit (g, ml, serving)" />
                <select value={foodBuilderCategory} onChange={event => setFoodBuilderCategory(event.target.value)}>{FOOD_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select>
                {[
                  ['Calories', foodBuilderCalories, setFoodBuilderCalories],
                  ['Protein (g)', foodBuilderProtein, setFoodBuilderProtein],
                  ['Carbohydrates (g)', foodBuilderCarbohydrates, setFoodBuilderCarbohydrates],
                  ['Fat (g)', foodBuilderFat, setFoodBuilderFat],
                  ['Fibre (g, optional)', foodBuilderFibre, setFoodBuilderFibre],
                  ['Sugar (g, optional)', foodBuilderSugar, setFoodBuilderSugar],
                ].map(([label, value, setter]) => <input key={label} type="number" min="0" step="0.01" value={value} onChange={event => setter(event.target.value)} placeholder={label} />)}
                <div className="food-builder-actions"><button className="primary-button" type="submit">{editingFoodId ? 'Save changes' : 'Add food'}</button><button className="secondary-button" type="button" onClick={() => setShowFoodBuilder(false)}>Cancel</button></div>
              </form>
              <div className="custom-food-list">
                {customFoods.map(food => <div key={food.id}><span>{food.name} · {food.calories} kcal/{food.servingSize}{food.servingUnit}</span><button className="clear-button" type="button" onClick={() => openFoodBuilder(food)}>Edit</button><button className="clear-button" type="button" onClick={() => deleteCustomFood(food)}>Delete</button></div>)}
              </div>
            </div>
          )}
        </section>)}

        {showAdvancedFeatures && (<section className="panel body-tracker-panel" id="body-tracker">
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
        </section>)}

        {showAdvancedFeatures && (<section className="panel exercise-library-panel" id="exercise-library">
          <div className="history-heading">
            <div>
              <div className="eyebrow">SMART EXERCISE DATABASE</div>
              <h2>Exercise library</h2>
              <p className="history-subtitle">
                Browse structured exercises, save favorites, and add your own movements.
              </p>
            </div>
            <button className="primary-button" onClick={() => openExerciseBuilder()}>
              + Custom exercise
            </button>
          </div>

          <div className="library-controls">
            <input
              type="search"
              value={librarySearch}
              onChange={event => setLibrarySearch(event.target.value)}
              placeholder="Search exercises..."
              aria-label="Search exercise library"
            />
            <select value={libraryMuscleFilter} onChange={event => setLibraryMuscleFilter(event.target.value)} aria-label="Filter library by muscle">
              <option value="all">All muscles</option>
              {LIBRARY_MUSCLE_GROUPS.map(group => <option value={group} key={group}>{group}</option>)}
            </select>
            <select value={libraryEquipmentFilter} onChange={event => setLibraryEquipmentFilter(event.target.value)} aria-label="Filter library by equipment">
              <option value="all">All equipment</option>
              {EXERCISE_EQUIPMENT.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
            <select value={libraryDifficultyFilter} onChange={event => setLibraryDifficultyFilter(event.target.value)} aria-label="Filter library by difficulty">
              <option value="all">All levels</option>
              {EXERCISE_DIFFICULTIES.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
            <select value={libraryCategoryFilter} onChange={event => setLibraryCategoryFilter(event.target.value)} aria-label="Filter library by category">
              <option value="all">All categories</option>
              {libraryCategories.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setLibrarySearch('');
                setLibraryMuscleFilter('all');
                setLibraryEquipmentFilter('all');
                setLibraryDifficultyFilter('all');
                setLibraryCategoryFilter('all');
              }}
            >
              Reset filters
            </button>
          </div>

          <div className="library-quick-row">
            <span>RECENT</span>
            {(recentExercises.length ? recentExercises : ['No recent exercises']).slice(0, 5).map(name => (
              <button
                type="button"
                key={name}
                className="library-chip"
                disabled={name === 'No recent exercises'}
                onClick={() => {
                  const match = allLibraryExercises.find(item => item.name.toLowerCase() === name.toLowerCase());
                  if (match) setSelectedLibraryExerciseId(match.id);
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="library-layout">
            <div className="library-list">
              {filteredLibraryExercises.length ? filteredLibraryExercises.map(exercise => (
                <article
                  className={selectedLibraryExercise?.id === exercise.id ? 'library-card selected' : 'library-card'}
                  key={exercise.id}
                  onClick={() => setSelectedLibraryExerciseId(exercise.id)}
                >
                  <div className="library-card-top">
                    <div>
                      <span className="library-card-category">{exercise.custom ? 'CUSTOM' : exercise.category}</span>
                      <h3>{exercise.name}</h3>
                    </div>
                    <button
                      type="button"
                      className={favoriteExercises.includes(exercise.name) ? 'library-favorite active' : 'library-favorite'}
                      onClick={event => {
                        event.stopPropagation();
                        toggleFavoriteExercise(exercise.name);
                      }}
                      aria-label={`${favoriteExercises.includes(exercise.name) ? 'Remove' : 'Add'} ${exercise.name} favorite`}
                    >
                      {favoriteExercises.includes(exercise.name) ? '★' : '☆'}
                    </button>
                  </div>
                  <p>{exercise.description}</p>
                  <div className="library-card-meta">
                    <span>{exercise.primaryMuscle}</span>
                    <span>{exercise.equipment}</span>
                    <span>{exercise.difficulty}</span>
                  </div>
                </article>
              )) : (
                <div className="progress-empty">No exercises match these filters.</div>
              )}
            </div>

            <aside className="library-detail">
              {selectedLibraryExercise ? (
                <>
                  <div className="library-detail-heading">
                    <div>
                      <span className="library-card-category">{selectedLibraryExercise.custom ? 'CUSTOM EXERCISE' : selectedLibraryExercise.category}</span>
                      <h3>{selectedLibraryExercise.name}</h3>
                    </div>
                    <div className="record-actions">
                      {selectedLibraryExercise.custom && (
                        <>
                          <button type="button" onClick={() => openExerciseBuilder(selectedLibraryExercise)}>Edit</button>
                          <button type="button" onClick={() => deleteCustomExercise(selectedLibraryExercise)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                  <p>{selectedLibraryExercise.description}</p>
                  <div className="library-detail-tags">
                    <span>{selectedLibraryExercise.primaryMuscle}</span>
                    {selectedLibraryExercise.secondaryMuscles.map(muscle => <span key={muscle}>{muscle}</span>)}
                    <span>{selectedLibraryExercise.equipment}</span>
                    <span>{selectedLibraryExercise.difficulty}</span>
                    <span>{selectedLibraryExercise.type}</span>
                  </div>
                  <h4>Instructions</h4>
                  <ol>{selectedLibraryExercise.instructions.map(step => <li key={step}>{step}</li>)}</ol>
                  {selectedLibraryExercise.tips.length > 0 && (
                    <>
                      <h4>Technique tips</h4>
                      <ul>{selectedLibraryExercise.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
                    </>
                  )}
                  {selectedLibraryExercise.mistakes.length > 0 && (
                    <>
                      <h4>Common mistakes</h4>
                      <ul>{selectedLibraryExercise.mistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul>
                    </>
                  )}
                  <div className="library-performance">
                    <h4>Your performance</h4>
                    {selectedLibraryRecord ? (
                      <p>
                        Best weight: <strong>{selectedLibraryRecord.heaviest.weight} kg</strong>
                        {' · '}Best volume: <strong>{selectedLibraryRecord.highestVolume.volume} kg</strong>
                      </p>
                    ) : <p>No saved performance for this exercise yet.</p>}
                    {selectedLibraryHistory.length > 0 && (
                      <div>{selectedLibraryHistory.map(entry => (
                        <span key={`${entry.date}-${entry.workoutName}`}>{entry.date}: {entry.weight} kg · {entry.volume} kg</span>
                      ))}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      openLogger();
                      setExercises(current => current.map((item, index) =>
                        index === 0 ? { ...item, name: selectedLibraryExercise.name } : item
                      ));
                      rememberExercise(selectedLibraryExercise.name);
                    }}
                  >
                    Use in workout
                  </button>
                </>
              ) : (
                <div className="library-detail-empty">
                  <h3>Select an exercise</h3>
                  <p>Choose an exercise to view instructions, performance, and workout history.</p>
                </div>
              )}
            </aside>
          </div>
          {suggestedLibraryExercises.length > 0 && (
            <div className="library-suggestions">
              <h3>Based on your training</h3>
              <div>{suggestedLibraryExercises.map(exercise => (
                <button type="button" className="library-chip" key={exercise.id} onClick={() => setSelectedLibraryExerciseId(exercise.id)}>
                  {exercise.name}
                </button>
              ))}</div>
            </div>
          )}
        </section>)}

        {/* EXERCISE HISTORY */}
        {activeScreen === 'progress' && <section className="panel exercise-history-panel" id="exercise-history">
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
        </section>}

        {showAdvancedFeatures && (<><section className="panel goals-panel" id="goals">
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
        </section></>)}

        {activeScreen === 'personal-records' && <section className="panel pr-notifications-panel" id="pr-notifications">
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
        </section>}

        {/* PERSONAL RECORDS */}
        {activeScreen === 'personal-records' && <section className="panel personal-records-panel" id="personal-records">
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
        </section>}

        {/* PERSONALIZED WORKOUT PLANS */}
        {activeScreen === 'plans' && <section className="panel plans-panel" id="plans">
          <div className="history-heading">
            <div>
              <div className="eyebrow">STRUCTURED TRAINING</div>
              <h2>Personal workout plans</h2>
              <p className="history-subtitle">
                Build your split, assign exercises, and track completed sessions.
              </p>
            </div>
            <div className="plan-header-actions">
              <button className="primary-button" onClick={startPlanBuilder}>
                + Create plan
              </button>
            </div>
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
                      <div className="plan-card-actions">
                        <button
                          className="clear-button"
                          onClick={() => deletePlan(activePlan.id)}
                        >
                          Delete plan
                        </button>
                      </div>
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
                            <button
                              className="secondary-button plan-log-button"
                              onClick={() => logPlanDay(day)}
                            >
                              Log this day
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
        </section>}

        {/* WORKOUT HISTORY */}
        {activeScreen === 'history' && <section className="panel history-panel" id="history">
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

          <div className="history-footer" id="settings">
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
        </section>}

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

      {/* SMART PLAN GENERATOR */}
      {showPlanGenerator && (
        <div className="modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setShowPlanGenerator(false);
        }}>
          <section className="workout-modal plan-generator-modal" role="dialog" aria-modal="true" aria-labelledby="plan-generator-title">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">DETERMINISTIC PLAN BUILDER</div>
                <h2 id="plan-generator-title">Generate a workout plan</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowPlanGenerator(false)} aria-label="Close">×</button>
            </div>

            <div className="generator-progress">
              {[1, 2, 3].map(step => (
                <span className={generatorStep >= step ? 'active' : ''} key={step}>
                  {step}. {step === 1 ? 'Goal' : step === 2 ? 'Setup' : 'Preview'}
                </span>
              ))}
            </div>

            {generatorStep === 1 && (
              <div className="generator-step">
                <h3>What are you training for?</h3>
                <div className="generator-choice-grid">
                  {GENERATOR_GOALS.map(goal => (
                    <button type="button" className={generatorGoal === goal.value ? 'generator-choice active' : 'generator-choice'} key={goal.value} onClick={() => setGeneratorGoal(goal.value)}>
                      <strong>{goal.label}</strong>
                      <span>Suggested starting structure</span>
                    </button>
                  ))}
                </div>
                <label className="form-label">Experience level
                  <select value={generatorExperience} onChange={event => setGeneratorExperience(event.target.value)}>
                    {EXERCISE_DIFFICULTIES.map(level => <option value={level} key={level}>{level}</option>)}
                  </select>
                </label>
                <div className="modal-actions">
                  <button type="button" className="primary-button" onClick={() => setGeneratorStep(2)}>Continue</button>
                </div>
              </div>
            )}

            {generatorStep === 2 && (
              <div className="generator-step">
                <h3>Shape your week</h3>
                <div className="generator-field-grid">
                  <label className="form-label">Training days
                    <select value={generatorFrequency} onChange={event => setGeneratorFrequency(Number(event.target.value))}>
                      {GENERATOR_FREQUENCIES.map(value => <option value={value} key={value}>{value} days per week</option>)}
                    </select>
                  </label>
                  <label className="form-label">Session duration
                    <select value={generatorDuration} onChange={event => setGeneratorDuration(Number(event.target.value))}>
                      {GENERATOR_DURATIONS.map(value => <option value={value} key={value}>{value} minutes</option>)}
                    </select>
                  </label>
                </div>
                <div className="form-label">
                  Available equipment
                  <div className="generator-checkbox-grid">
                    {GENERATOR_EQUIPMENT.map(item => (
                      <label key={item.value}>
                        <input
                          type="checkbox"
                          checked={generatorEquipment.includes(item.value)}
                          onChange={event => setGeneratorEquipment(current =>
                            event.target.checked
                              ? [...new Set([...current, item.value])]
                              : current.filter(value => value !== item.value)
                          )}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  {generatorEquipment.includes('custom') && (
                    <input
                      className="generator-custom-equipment"
                      value={generatorCustomEquipment}
                      onChange={event => setGeneratorCustomEquipment(event.target.value)}
                      placeholder="Enter equipment, separated by commas"
                      aria-label="Custom equipment"
                    />
                  )}
                </div>
                <div className="form-label">
                  Target muscles <span className="form-help">Leave empty for a balanced selection.</span>
                  <div className="generator-checkbox-grid">
                    {GENERATOR_MUSCLES.map(muscle => (
                      <label key={muscle}>
                        <input
                          type="checkbox"
                          checked={generatorMuscles.includes(muscle)}
                          onChange={event => setGeneratorMuscles(current =>
                            event.target.checked
                              ? [...current, muscle]
                              : current.filter(value => value !== muscle)
                          )}
                        />
                        {muscle}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="timer-checkbox">
                  <input type="checkbox" checked={generatorRestDays} onChange={event => setGeneratorRestDays(event.target.checked)} />
                  Keep rest days between repeated muscle groups
                </label>
                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={() => setGeneratorStep(1)}>Back</button>
                  <button type="button" className="primary-button" onClick={generateWorkoutPlan}>Generate preview</button>
                </div>
              </div>
            )}

            {generatorStep === 3 && (
              <div className="generator-step">
                <div className="generator-preview-heading">
                  <div>
                    <h3>Generated plan preview</h3>
                    <p>Suggested values are editable starting points, not prescriptions.</p>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => setGeneratorStep(2)}>Change setup</button>
                </div>
                {generatorNotice && <p className="form-help generator-notice">{generatorNotice}</p>}
                <div className="generated-day-list">
                  {generatedDays.map(day => (
                    <article className="generated-day-card" key={day.id}>
                      <div className="generated-day-heading">
                        <div>
                          <span className="panel-tag">{day.targetMuscles.join(' · ') || 'Balanced'}</span>
                          <h4>{day.name}</h4>
                        </div>
                        <span>{day.exercises.length} exercises · ~{day.estimatedMinutes} min</span>
                      </div>
                      <div className="generated-exercise-list">
                        {day.exercises.map(exercise => (
                          <div className="generated-exercise-row" key={exercise.id}>
                            <strong>{exercise.name}</strong>
                            <input type="number" min="1" value={exercise.sets} onChange={event => updateGeneratedExercise(day.id, exercise.id, 'sets', Number(event.target.value))} aria-label={`${exercise.name} sets`} />
                            <input value={exercise.reps} onChange={event => updateGeneratedExercise(day.id, exercise.id, 'reps', event.target.value)} aria-label={`${exercise.name} reps`} />
                            <input type="number" min="15" step="15" value={exercise.restSeconds} onChange={event => updateGeneratedExercise(day.id, exercise.id, 'restSeconds', Number(event.target.value))} aria-label={`${exercise.name} rest seconds`} />
                            <button type="button" className="clear-button" onClick={() => removeGeneratedExercise(day.id, exercise.id)}>Remove</button>
                          </div>
                        ))}
                      </div>
                      {day.restAfter && <div className="generated-rest-note">Rest day recommended before the next training session.</div>}
                      <label className="generated-add-exercise">Add library exercise
                        <select value="" onChange={event => addGeneratedExercise(day.id, event.target.value)}>
                          <option value="">Choose exercise</option>
                          {allLibraryExercises.filter(exercise => !day.exercises.some(item => item.name === exercise.name)).map(exercise => <option value={exercise.name} key={exercise.id}>{exercise.name}</option>)}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={generateWorkoutPlan}>Regenerate</button>
                  <button type="button" className="primary-button" onClick={saveGeneratedPlan}>Save to workout plans</button>
                </div>
              </div>
            )}
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

      {showExerciseBuilder && (
        <div className="modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setShowExerciseBuilder(false);
        }}>
          <section className="workout-modal exercise-builder-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-builder-title">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">{editingExerciseId ? 'UPDATE LIBRARY ENTRY' : 'NEW LIBRARY ENTRY'}</div>
                <h2 id="exercise-builder-title">{editingExerciseId ? 'Edit custom exercise' : 'Create custom exercise'}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowExerciseBuilder(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={saveCustomExercise}>
              <label className="form-label">Exercise name<input value={exerciseBuilderName} onChange={event => setExerciseBuilderName(event.target.value)} required /></label>
              <div className="exercise-fields">
                <label className="form-label">Primary muscle<select value={exerciseBuilderPrimary} onChange={event => setExerciseBuilderPrimary(event.target.value)}>{LIBRARY_MUSCLE_GROUPS.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
                <label className="form-label">Equipment<select value={exerciseBuilderEquipment} onChange={event => setExerciseBuilderEquipment(event.target.value)}>{EXERCISE_EQUIPMENT.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
                <label className="form-label">Difficulty<select value={exerciseBuilderDifficulty} onChange={event => setExerciseBuilderDifficulty(event.target.value)}>{EXERCISE_DIFFICULTIES.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
              </div>
              <label className="form-label">Secondary muscles
                <select multiple value={exerciseBuilderSecondary} onChange={event => setExerciseBuilderSecondary([...event.target.selectedOptions].map(option => option.value))}>
                  {LIBRARY_MUSCLE_GROUPS.filter(item => item !== exerciseBuilderPrimary).map(item => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <div className="exercise-fields">
                <label className="form-label">Exercise type<select value={exerciseBuilderType} onChange={event => setExerciseBuilderType(event.target.value)}>{EXERCISE_TYPES.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
                <label className="form-label">Category<input value={exerciseBuilderCategory} onChange={event => setExerciseBuilderCategory(event.target.value)} placeholder="e.g. Mobility" /></label>
              </div>
              <label className="form-label">Description<textarea rows="3" value={exerciseBuilderDescription} onChange={event => setExerciseBuilderDescription(event.target.value)} /></label>
              <label className="form-label">Instructions (one step per line)<textarea rows="5" value={exerciseBuilderInstructions} onChange={event => setExerciseBuilderInstructions(event.target.value)} placeholder="Set up...\nPerform the movement...\nReturn with control..." /></label>
              {notice && <p className="form-notice">{notice}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowExerciseBuilder(false)}>Cancel</button>
                <button type="submit" className="primary-button">{editingExerciseId ? 'Save changes' : 'Create exercise'}</button>
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
              cancelWorkoutTimer();
            }
          }}
        >
          <section
            className="workout-modal"
            id="workout-logger"
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
                onClick={cancelWorkoutTimer}
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

              {showAdvancedFeatures && !editingWorkoutId && (
                <div className={`timer-launcher ${timerSession ? 'is-active' : ''}`}>
                  <div>
                    <span className="timer-control-label">
                      {timerSession
                        ? timerSession.status === 'paused' ? 'WORKOUT PAUSED' : 'WORKOUT IN PROGRESS'
                        : 'SESSION TIMER'}
                    </span>
                    <strong>
                      {timerSession
                        ? formatWorkoutTime(activeTimerElapsed)
                        : 'Start when you begin training'}
                    </strong>
                  </div>
                  {!timerSession && (
                    <button type="button" className="secondary-button" onClick={startWorkoutTimer}>
                      Start workout
                    </button>
                  )}
                  {timerSession?.status === 'running' && (
                    <button type="button" className="secondary-button" onClick={pauseWorkoutTimer}>
                      Pause
                    </button>
                  )}
                  {timerSession?.status === 'paused' && (
                    <button type="button" className="secondary-button" onClick={resumeWorkoutTimer}>
                      Resume
                    </button>
                  )}
                  {timerSession && (
                    <button type="button" className="primary-button" onClick={finishWorkoutTimer}>
                      Finish
                    </button>
                  )}
                </div>
              )}

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
                    {showAdvancedFeatures && <div className="set-actions">
                      <button
                        type="button"
                        className="rest-inline-button"
                        onClick={() => completeExerciseSet(exercise.name)}
                      >
                        Set complete
                      </button>
                      <button
                        type="button"
                        className="rest-inline-button"
                        onClick={() => startRestTimer(restPreset === 'custom' ? customRestSeconds : restPreset)}
                      >
                        Start {restPreset === 'custom' ? `${customRestSeconds}s` : `${restPreset}s`} rest
                      </button>
                    </div>}

                    <label className="form-label">
                      Exercise name
                      <select
                        value={exercise.name}
                        onChange={event => {
                          updateExercise(exercise.id, 'name', event.target.value);
                          rememberExercise(event.target.value);
                        }}
                        aria-label={`Library exercise ${index + 1}`}
                      >
                        <option value="">Choose from library</option>
                        {[...new Set([...libraryExerciseNames, ...exerciseNames])].sort().map(name => (
                          <option value={name} key={name}>{name}</option>
                        ))}
                      </select>
                      <input
                        value={exercise.name}
                        onChange={event =>
                          updateExercise(exercise.id, 'name', normalizeExerciseName(event.target.value))
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
                  onClick={cancelWorkoutTimer}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingWorkoutId ? 'Save changes' : 'Save workout'}
                </button>
              </div>
              {showAdvancedFeatures && <div className="timer-preferences">
                <div className="timer-preferences-heading">
                  <span className="timer-control-label">TIMER PREFERENCES</span>
                  <span>Saved on this device</span>
                </div>
                <label>
                  Default rest
                  <select
                    value={timerPreferences.defaultRestSeconds}
                    onChange={event => setTimerPreferences(current => ({
                      ...current,
                      defaultRestSeconds: Number(event.target.value),
                    }))}
                  >
                    <option value="30">30 seconds</option>
                    <option value="45">45 seconds</option>
                    <option value="60">60 seconds</option>
                    <option value="90">90 seconds</option>
                    <option value="120">120 seconds</option>
                  </select>
                </label>
                <label className="timer-checkbox">
                  <input
                    type="checkbox"
                    checked={timerPreferences.soundEnabled}
                    onChange={event => setTimerPreferences(current => ({
                      ...current,
                      soundEnabled: event.target.checked,
                    }))}
                  />
                  Sound when rest ends
                </label>
                <label className="timer-checkbox">
                  <input
                    type="checkbox"
                    checked={timerPreferences.autoRestPrompt}
                    onChange={event => setTimerPreferences(current => ({
                      ...current,
                      autoRestPrompt: event.target.checked,
                    }))}
                  />
                  Prompt to start rest after a set
                </label>
                <label>
                  Countdown warning
                  <select
                    value={timerPreferences.warningSeconds}
                    onChange={event => setTimerPreferences(current => ({
                      ...current,
                      warningSeconds: Number(event.target.value),
                    }))}
                  >
                    <option value="0">Off</option>
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                    <option value="15">15 seconds</option>
                  </select>
                </label>
              </div>}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;