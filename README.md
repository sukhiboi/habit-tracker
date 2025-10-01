# Habit Tracker

A modern, mobile-first Progressive Web App (PWA) for tracking daily habits. Built with React 19, TypeScript, and Tailwind CSS.

## Features

- **Setup Screen**: Personalized onboarding with name and initial habit creation
- **Habit Management**: Add, delete, complete, and revert habit completions
- **Swipe Gestures**: Intuitive swipe-to-complete functionality
- **Progress Tracking**: Real-time progress bar showing today's completion rate
- **Calendar View**: Visual calendar with progress circles for each day
- **Data Management**:
  - Local-first storage using localStorage
  - Import/Export habits in JSON format
  - Clear all data option
- **Mobile-Only Design**: Optimized exclusively for mobile devices
- **PWA Support**: Installable app with offline capabilities

## Tech Stack

- **React 19**: Latest React features including optimized rendering
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible UI components
- **Jest + React Testing Library**: Comprehensive unit tests
- **GitHub Actions**: Automated CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser and navigate to the local development server (usually http://localhost:5173).

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Building

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── Calendar.tsx   # Calendar view component
│   ├── HabitCard.tsx  # Individual habit card with swipe
│   ├── HabitList.tsx  # List of all habits
│   ├── Navigation.tsx # Bottom navigation
│   ├── ProgressBar.tsx # Today's progress indicator
│   ├── Settings.tsx   # Settings and data management
│   └── Setup.tsx      # Initial setup screen
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   ├── date.ts        # Date manipulation helpers
│   ├── habits.ts      # Habit logic and operations
│   └── storage.ts     # localStorage management
├── lib/               # Library utilities
│   └── utils.ts       # Tailwind merge utility
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind config

```

## Features in Detail

### Swipe Gestures
- Swipe right on a habit card to mark it as complete
- Swipe left on a completed habit to undo
- The first habit card is 3x the height of others for emphasis

### Calendar View
- Shows a full month calendar with progress indicators
- Each date has a circular progress indicator
- Progress is calculated based on the percentage of habits completed that day

### Data Persistence
- All data is stored locally in the browser's localStorage
- Export your data as JSON for backup
- Import previously exported data
- Clear all data to start fresh (returns to setup screen)

### Mobile-First Design
- Full-height container with scrollable content
- Optimized for touch interactions
- Bottom navigation for easy thumb access
- Only accessible on mobile devices (or narrow browser widths)

## Deployment

The app is configured to deploy to GitHub Pages automatically via GitHub Actions.

### Setup GitHub Pages

1. Go to your repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to the `main` branch to trigger deployment

The app will be available at: `https://[username].github.io/habit-tracker/`

## CI/CD Pipeline

The GitHub Actions workflow:
1. Runs linter on every push and PR
2. Executes all unit tests
3. Builds the application
4. Deploys to GitHub Pages (main branch only)

## License

MIT