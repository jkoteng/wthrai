# WHTRAI Weather Intelligence Dashboard

A polished weather dashboard built for the WeatherAI assignment. It consumes WeatherAI data through a Firebase Functions proxy, presents a clean executive-style UI, and focuses on practical product decisions: fast loading, graceful fallbacks, saved preferences, and a clear architecture story.

**Live demo:** https://wthrai.web.app/

---

## Project thesis

The goal of this project was not just to show weather data, but to demonstrate how I approach a real-world API integration problem under short time contraints.

- consume a third-party API cleanly,
- avoid exposing secrets in the browser,
- handle CORS safely,
- persist useful user preferences locally,
- keep the UI structured,
- and ship a deployment that is easy to verify.

To solve the CORS and secret-management problem, the frontend does **not** call WeatherAI directly from the browser. Instead, it calls a Firebase Function proxy, which then talks to WeatherAI server-side and returns the data to the app.

---

## Features

- Automatic location-based weather lookup
- Search by city and county / region
- Current weather snapshot
- Wear recommendation based on weather conditions
- Saved cities stored in `localStorage`
- Quick example locations
- Error and empty-state handling
- Responsive dashboard shell with fixed top bar and sidebar
- Clean, modular CSS architecture using CSS Modules

---

## Why this architecture

This app was intentionally structured to show a production-minded approach.

### Frontend
The React application is responsible for:
- rendering the dashboard,
- managing user interactions,
- displaying loading / error / empty states,
- and storing saved cities locally.

### Backend proxy
A Firebase Function acts as a lightweight API proxy:
- keeps the WeatherAI API key off the client,
- avoids browser-to-third-party CORS failures,
- and creates a safer integration boundary.

### Storage
Saved cities are stored in the browser using `localStorage`, which was enough for the assignment and keeps the solution simple.

### Styling
The layout is separated into:
- `AppShell` for the app frame,
- `TopBar` for the header,
- `Sidebar` for navigation,
- `Dashboard.module.css` and `AppShell.module.css` for styling.

This separation keeps the codebase easier to extend and easier to explain.

## Screenshots

### Dashboard Overview

![Dashboard Overview](docs/dashboard-overview.png)

### Weather Results

![Weather Search](docssearch-weather.png)

---

## Tech stack

- React
- TypeScript
- Firebase Hosting
- Firebase Cloud Functions
- WeatherAI API
- CSS Modules
- localStorage

---

## Folder structure

```text
src/
  components/
    layout/
      AppShell.tsx
      TopBar.tsx
      Sidebar.tsx
      AppShell.module.css
    weather/
      WeatherMetrics.tsx
      AiSummaryCard.tsx
  hooks/
    useWeather.ts
  pages/
    Dashboard.tsx
    Dashboard.module.css
  style/
    appshell.module.css
```

Backend:

```text
functions/
  index.js
```

---

## Data flow

```text
User in browser
  → React dashboard
  → Firebase Function (weatherProxy)
  → WeatherAI API
  → Firebase Function returns JSON
  → Dashboard renders UI
```

This keeps the client thin and avoids exposing the API key in the frontend bundle.

---

## Setup locally

### 1. Clone the repository
```bash
git clone https://github.com/jkoteng/wthrai.git
cd wthrai
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install Firebase Functions dependencies
```bash
cd functions
npm install
cd ..
```

### 4. Set the WeatherAI secret for Functions
```bash
firebase functions:secrets:set WEATHER_AI_API_KEY
```

Paste your WeatherAI API key when prompted.

### 5. Run the React app locally
```bash
npm start
```

---

## Firebase deployment

### Build the app
```bash
npm run build
```

### Deploy hosting and functions
```bash
firebase deploy --only functions,hosting
```

---

## Notes on the API integration

The app uses WeatherAI for weather data. The function proxy forwards requests to WeatherAI with the secret API key stored securely on the server side.

The frontend then reads the returned weather payload and derives the UI state from it.

---

## Design decisions

A few choices were made to make the submission stronger:

- The hero section carries the main weather story.
- Supporting cards break down the rest of the experience into readable sections.
- The sidebar clearly communicates what is available now vs. what is planned later.
- The layout uses fixed shell regions so the dashboard feels stable and intentional.
- Saved cities are local-first, which keeps the app simple and fast.

---

## Future improvements

If this were extended beyond the assignment, the next logical upgrades would be:

- a proper user account system,
- cloud-synced saved locations,
- richer hourly/daily forecast visualizations,
- usage/quota visibility,
- ai summaries & suggestions
- and a fuller analytics view.

---

## Live deployment

**Firebase Hosting URL:** https://wthrai.web.app/

---

## Author

Joe Koteng
