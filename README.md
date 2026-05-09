# Twenty Inbox Demo

A polished React demo of a relationship-aware inbox, inspired by the way a CRM or work management tool can turn notifications into clear, actionable tasks.

The app includes an inbox table, task action panel, focus-based filtering, linked record details, responsive mobile layouts, animated panels, and light/dark theme support.

## Features

- Task inbox with read, selected, done, and undo states
- Focus filter that groups tasks by graph distance
- Slide-in action panel with task actions and co-resolve suggestions
- Record detail view for tasks, people, companies, opportunities, and notes
- Linked chips that navigate into related records
- Responsive desktop and mobile layouts
- Initial loading screen and Framer Motion transitions
- Twenty-inspired design tokens with light and dark themes

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
```

Starts the Vite dev server.

```bash
npm run build
```

Creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally.

## Project Structure

```text
src/
  app/
    inboxModel.js
  actions/
    Actions.jsx
  components/
    app/
      AppHeader.jsx
      InboxView.jsx
      ActionPanelSlot.jsx
      MobileNav.jsx
      RecordView.jsx
      UndoToast.jsx
      InitialLoader.jsx
    common/
    filter/
    layout/
      ActionPanel.jsx
      RecordDetail.jsx
      Sidebar.jsx
      recordDetail/
    task/
  context/
  data/
  utils/
  App.jsx
  index.css
  index.jsx
```

## Notes

This is a frontend-only demo. The task, graph, and record data are stored locally in `src/data`, so no backend or environment variables are required to run it.

Deployment notes are available in [DEPLOYMENT.md](./DEPLOYMENT.md).
