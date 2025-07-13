# Development & Deployment Workflow

## 🚀 How to Make Changes and Dep## 📚 Additional Documentation

- `developer_docs/custom-cursor-implementation.md` - Custom cursor features  
- `developer_docs/scroll-aware-hover.md` - Scroll-aware hover effectsYour portfolio automatically deploys to `rivnat.me` when you push to the main branch.

### Quick Development Cycle

```bash
# Test your changes locally
npm run dev          # Start development server at localhost:5173

# Build and preview production version
npm run build        # Build for production
npm run preview      # Preview at localhost:4173

# Deploy your changes
git add .
git commit -m "Update portfolio"
git push origin main  # Auto-deploys to rivnat.me
```

### Development Workflow Options

#### Option 1: Direct Changes (Quick updates)
```bash
git checkout main
# Make your changes to components, styles, etc.
git add .
git commit -m "Quick update"
git push origin main  # Auto-deploys in 1-3 minutes
```

#### Option 2: Feature Branch (Recommended for major changes)
```bash
git checkout -b feature/new-section
# Make your changes
git add .
git commit -m "Add new portfolio section"
git push origin feature/new-section
# Create PR on GitHub, review, then merge to main
```

#### Option 3: Branch Switching (Your preferred method)
```bash
# Switch to your development branch
git checkout your-dev-branch
# Make changes and test locally

# When ready to deploy
git checkout main
git merge your-dev-branch  # Or cherry-pick specific commits
git push origin main       # Triggers deployment
```

## 🔄 Deployment Process

1. **You push to main** → GitHub Actions triggered
2. **Build process** → `npm ci` + `npm run build` 
3. **Deploy** → Built files uploaded to GitHub Pages
4. **Live** → Site updated at `https://rivnat.me`

**Deployment time**: Usually 1-3 minutes

## � Troubleshooting

**Build fails?** Run `npm run build` locally to debug  
**Site not updating?** Check GitHub Actions tab in your repo  
**Assets not loading?** Clear browser cache and check console  

## � Additional Documentation

- `developer_docs/DEPLOYMENT_GUIDE.md` - Detailed deployment setup guide
- `developer_docs/custom-cursor-implementation.md` - Custom cursor features  
- `developer_docs/scroll-aware-hover.md` - Scroll-aware hover effects

---
**Live Site**: 🌐 https://rivnat.me
