# Deployment Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- A Vercel account (free at https://vercel.com)
- Git repository setup (already done)
- GitHub account (recommended for easy Vercel integration)

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### 3. Build for production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## Deploy to Vercel

### Option 1: Using Vercel CLI (Quick Setup)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from project directory:**
   ```bash
   cd c:\Users\User\Desktop\Dev\twenty-inbox-demo
   vercel
   ```

3. **Follow the interactive prompts:**
   - Connect to your Vercel account during first deployment
   - Enter project name (or press Enter to use folder name)
   - Select environment (production)
   - Allow Vercel to create `vercel.json` (already done)

4. **Link to production (after first deployment):**
   ```bash
   vercel --prod
   ```

5. **Your app will be live at:** `https://[your-project-name].vercel.app`

### Option 2: GitHub Integration (Recommended for Continuous Deployment)

This method auto-deploys on every push to your repository.

1. **Push code to GitHub:**
   ```bash
   cd c:\Users\User\Desktop\Dev\twenty-inbox-demo
   git add .
   git commit -m "Initial setup for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel via GitHub:**
   - Go to https://vercel.com/new
   - Click "Continue with GitHub" (you'll need to authorize Vercel)
   - Select your repository
   - Leave build settings as default (Vercel auto-detects Vite)
   - Click "Deploy"

3. **Enable automatic deployments:**
   - Vercel will automatically deploy on every push to `main`
   - Create preview deployments for pull requests

## Project Structure

```
twenty-inbox-demo/
├── src/
│   ├── index.jsx           # React entry point
│   └── index.css           # Global styles & Tailwind imports
├── public/
│   └── (static assets go here)
├── *.jsx                   # React components
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite bundler configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vercel.json             # Vercel deployment settings
└── dist/                   # Production build output (generated)
```

## Environment Variables

To add environment variables for deployment:

### 1. Local development (.env.local)
Create `.env.local` in the root directory:
```
VITE_API_URL=https://api.example.com
VITE_AUTH_TOKEN=your_token_here
```

**Important:** Only variables prefixed with `VITE_` are exposed to the browser.

### 2. Vercel environment variables
Add via Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add variables (same format aslocal)

Variables in Vercel will override local ones in production.

## Available Scripts

- `npm run dev` - Start Vite dev server (hot reload enabled)
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally

## Troubleshooting

### Build fails locally
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check for syntax errors in component files

### Styling not applied
- Verify Tailwind CSS configuration in `tailwind.config.js`
- Check that CSS files are imported in `src/index.jsx`
- Clear browser cache (Ctrl+Shift+Delete)

### Module resolution errors
- Ensure imports use `.jsx` extension or no extension (both work)
- Check relative paths are correct (e.g., `./ComponentName` not `./ComponentName.js`)

### Deployment fails on Vercel
- Check build logs in Vercel dashboard
- Ensure `package.json` scripts are correct
- Verify all imports are relative paths (no absolute paths)

## Performance Tips

- The app is automatically minified and optimized during build
- Tailwind CSS is purged to include only used styles
- Assets are cached with content hashing

## Next Steps

1. Customize the app and add features
2. Add environment variables if needed
3. Set up custom domain on Vercel (optional)
4. Configure GitHub deployment protection rules

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)

