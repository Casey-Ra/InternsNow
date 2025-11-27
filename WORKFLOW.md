# Git Workflow for InternsNow

## Branch Structure

- **`main`** - Production environment (Vercel production deployment)
- **`develop`** - Staging environment (Vercel preview deployment)
- **`feature/*`** - Feature branches (individual features/fixes)

---

## Daily Development Workflow

### 1. Start New Feature
```bash
# Make sure you're on develop and up-to-date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/job-search-filters
```

### 2. Make Changes
```bash
# Make your code changes, then:
git add .
git commit -m "Add job search filters"

# Push to GitHub
git push origin feature/job-search-filters
```

### 3. Create Pull Request
```bash
# Option A: Using GitHub CLI
gh pr create --base develop --title "Add job search filters"

# Option B: Use GitHub web interface
# Go to: https://github.com/Casey-Ra/InternsNow/pulls
# Click "New Pull Request"
```

### 4. CI Checks Run Automatically
GitHub Actions will automatically:
- ✅ Run ESLint
- ✅ Type-check TypeScript
- ✅ Build the app
- ✅ Vercel creates preview deployment

### 5. Merge PR
Once checks pass:
- Review changes on preview URL
- Click "Merge Pull Request" on GitHub
- Delete feature branch after merge

---

## Deploying to Production

### When Ready for Production Release
```bash
# Create PR from develop → main
git checkout develop
git pull origin develop

# Create production release PR
gh pr create --base main --title "Release: [Feature summary]"
```

### After Merging to `main`
- Vercel automatically deploys to production
- Monitor for errors in Vercel dashboard

---

## Branch Protection (To Be Configured)

### On GitHub:
1. Settings → Branches → Add Rule
2. Branch pattern: `main`
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require status checks (lint, type-check, build)
   - ✅ Require branches to be up to date

---

## Quick Reference

```bash
# Daily development
git checkout develop
git pull
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
gh pr create --base develop

# Production release
git checkout develop
gh pr create --base main
```

## Environment Variables

- **Local**: `.env.local` (not committed)
- **Vercel Staging**: Configured in Vercel dashboard for `develop` branch
- **Vercel Production**: Configured in Vercel dashboard for `main` branch
