# 🏋️ ZENTRAQ FORGE

### Personal Workout Tracking & Progress Dashboard

ZENTRAQ FORGE is a personal gym and workout-tracking web application designed to help users record their workout sessions, calculate training volume, track fitness activity, and monitor their progress through an interactive dashboard.

## 🚀 Features

- **Workout Logging:** Record workout sessions with exercise names, sets, repetitions, and weights.
- **Volume Calculation:** Automatically calculates workout volume using Sets × Repetitions × Weight.
- **Dashboard Statistics:** View total workouts, training time, total volume, and current workout streak.
- **Weekly Activity Chart:** Visualize workout frequency throughout the week.
- **Volume Progress Chart:** Compare workout volume across recent sessions.
- **Workout History:** Search, filter, and sort saved workout records.
- **Edit & Delete:** Update or delete individual workout sessions.
- **JSON Backup & Restore:** Export workout data and import previous backups.
- **Demo Records:** Sample workout entries to demonstrate the application.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User Interface |
| Vite | Development Environment |
| JavaScript | Application Logic |
| CSS | Styling & Responsive Design |
| localStorage | Browser-based Data Storage |
| JSON | Data Backup & Restore |

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

**1. Clone the repository**

```bash
git clone https://github.com/dnsh-git/ZenTraq-Forge.git
```

**2. Navigate to the project folder**

```bash
cd ZENTRAQ-FORGE
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 💾 Data Storage

ZENTRAQ FORGE currently uses browser `localStorage` to save workout records.

- Data is stored locally in the browser.
- Storage key: `zentraq-workouts`
- JSON export allows users to back up their workout records.
- JSON import allows users to restore a previous backup.

**Note:** Clearing browser storage or switching devices may result in data loss if no backup is available.

## 🔮 Future Scope

The following features are planned for future development:

- Personalized workout plan creation.
- Push/Pull/Legs and Upper/Lower workout routines.
- Backend and database integration.
- User registration and authentication.
- Cloud synchronization across devices.
- Advanced progress analytics.
- Exercise-level personal records.
- Improved data validation and testing.

## 📌 Project Status

**Frontend Prototype – Browser-based Persistence**

The current version provides core workout tracking, progress visualization, workout history management, and JSON backup functionality.

Backend integration, authentication, and cloud synchronization are not currently implemented.

## 🎯 Project Objective

The main objective of ZENTRAQ FORGE is to make personal workout tracking simple, organized, and accessible through a single dashboard.

---

**Developed with ❤️ using React & JavaScript**

*ZENTRAQ FORGE – Track Your Training. Measure Your Progress. Build Your Strength.*