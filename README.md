# twenty-inbox-demo

A React-based inbox management UI demonstrating task prioritization and organization with focus-based filtering.

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev
```

The app runs on `http://localhost:3000`

### Production Build
```bash
npm run build
```

Creates an optimized build in the `dist/` folder.

## Technology Stack

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

## Deployment

### Deploy to Vercel (Recommended)

**Option 1: Using Vercel CLI**
```bash
npm install -g vercel
vercel
vercel --prod  # Link to production
```

**Option 2: GitHub Integration**
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your repository and click Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
├── src/
│   ├── index.jsx           # React entry point
│   └── index.css           # Global styles
├── index.html              # HTML entry point
├── *.jsx                   # React components
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview build locally

## Environment Variables

Create `.env.local` for local development:
```
VITE_API_URL=https://api.example.com
```

Only variables prefixed with `VITE_` are exposed to the browser.

## Features

- Task inbox with focus-based filtering
- Relationship graph visualization of tasks
- Priority and status management
- Responsive UI with Tailwind CSS

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)
