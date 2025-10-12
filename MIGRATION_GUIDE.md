# Migration Guide: GO Train Group Pass App → CivicTechWR

## 🎯 Migration Overview

This guide outlines the process for migrating the GO Train Group Pass Coordination App from the current repository to the [CivicTechWR organization](https://github.com/civicTechWR/).

## ✅ Pre-Migration Checklist

### Repository Hygiene Status: **PASSED** ✅
- [x] Build passes successfully
- [x] ESLint configuration working
- [x] Prettier formatting applied
- [x] No debugger statements in production code
- [x] No large files in git
- [x] No hardcoded secrets
- [x] Documentation complete
- [x] Security workflows implemented

### Repository Structure: **READY** ✅
```
go-transit-group/
├── .gitea/workflows/          # CI/CD workflows
├── .github/workflows/         # GitHub Actions (for migration)
├── app/                       # Next.js app directory
├── components/                # React components
├── contexts/                  # React contexts
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── public/                    # Static assets
├── scripts/                   # Build and utility scripts
├── supabase/                  # Database migrations
├── docs/                      # Documentation
├── community/                 # Community guidelines
├── README.md                  # Project overview
├── CLAUDE.md                  # Development guide
├── MIGRATION_GUIDE.md         # This file
└── package.json               # Dependencies
```

## 🚀 Migration Steps

### Step 1: GitHub Authentication Setup

**Option A: Using GitHub CLI (Recommended)**
```bash
# Install GitHub CLI (if not already installed)
# On Fedora/CentOS/RHEL:
sudo dnf install -y gh

# On Ubuntu/Debian:
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Authenticate with GitHub
gh auth login
```

**Option B: Using Personal Access Token**
```bash
# Set GitHub token environment variable
export GH_TOKEN="your_github_personal_access_token"

# Or add to ~/.bashrc for persistence
echo 'export GH_TOKEN="your_github_personal_access_token"' >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Verify Organization Access

```bash
# Check if you have access to CivicTechWR organization
gh api orgs/civicTechWR

# List organization repositories
gh api orgs/civicTechWR/repos
```

### Step 3: Create New Repository

```bash
# Navigate to project directory
cd /opt/go-transit-group

# Create new repository in CivicTechWR organization
gh repo create civicTechWR/go-train-group-pass \
  --public \
  --description "GO Train weekday group pass coordination app - replaces WhatsApp-based coordination" \
  --homepage "https://github.com/civicTechWR/go-train-group-pass" \
  --add-readme=false
```

### Step 4: Update Remote URLs

```bash
# Add new remote
git remote add civictech https://github.com/civicTechWR/go-train-group-pass.git

# Verify remotes
git remote -v

# Should show:
# origin    https://gitea.dredre.net/ondre/go-transit-group.git (fetch)
# origin    https://gitea.dredre.net/ondre/go-transit-group.git (push)
# civictech https://github.com/civicTechWR/go-train-group-pass.git (fetch)
# civictech https://github.com/civicTechWR/go-train-group-pass.git (push)
```

### Step 5: Push to New Repository

```bash
# Push all branches and tags to new repository
git push civictech main
git push civictech --tags

# If you have other branches:
git push civictech develop
git push civictech feature/*
```

### Step 6: Update Configuration Files

After migration, update the following files:

**1. Update README.md**
```markdown
# GO Train Group Pass Coordination App

[![CI/CD](https://github.com/civicTechWR/go-train-group-pass/workflows/CI/badge.svg)](https://github.com/civicTechWR/go-train-group-pass/actions)
[![Security](https://github.com/civicTechWR/go-train-group-pass/workflows/Security%20Scan/badge.svg)](https://github.com/civicTechWR/go-train-group-pass/actions)

A modern web application that replaces WhatsApp-based coordination for GO Train weekday group passes between Kitchener and Union Station.

## 🏢 Organization

This project is maintained by [CivicTechWR](https://github.com/civicTechWR) - a community of civic technologists in Waterloo Region.
```

**2. Update package.json**
```json
{
  "name": "@civictechwr/go-train-group-pass",
  "repository": {
    "type": "git",
    "url": "https://github.com/civicTechWR/go-train-group-pass.git"
  },
  "bugs": {
    "url": "https://github.com/civicTechWR/go-train-group-pass/issues"
  },
  "homepage": "https://github.com/civicTechWR/go-train-group-pass#readme"
}
```

**3. Update GitHub Actions workflows**
- Update workflow file paths from `.gitea/workflows/` to `.github/workflows/`
- Update any organization-specific references

### Step 7: Set Up GitHub Actions

```bash
# Copy Gitea workflows to GitHub Actions format
mkdir -p .github/workflows
cp .gitea/workflows/*.yml .github/workflows/

# Update workflow files to use GitHub Actions syntax
# (See workflow conversion guide below)
```

### Step 8: Configure Repository Settings

In the GitHub repository settings:

1. **General Settings**
   - Enable Issues
   - Enable Projects
   - Enable Wiki (optional)
   - Enable Discussions (optional)

2. **Security Settings**
   - Enable Dependabot alerts
   - Enable Dependabot security updates
   - Enable secret scanning
   - Enable push protection

3. **Actions Settings**
   - Allow all actions and reusable workflows
   - Enable required status checks for main branch

4. **Branch Protection**
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Restrict pushes to main branch

### Step 9: Set Up Environment Variables

In GitHub repository settings → Secrets and variables → Actions:

**Required Secrets:**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
TWILIO_PHONE_NUMBER
FIREBASE_SERVICE_ACCOUNT_KEY
INNGEST_SIGNING_KEY
INNGEST_EVENT_KEY
RESEND_API_KEY
DOCKER_REGISTRY_URL
DOCKER_REGISTRY_USERNAME
DOCKER_REGISTRY_PASSWORD
```

### Step 10: Verify Migration

```bash
# Clone the new repository to verify
git clone https://github.com/civicTechWR/go-train-group-pass.git
cd go-train-group-pass

# Run tests
npm install
npm run build
npm run test

# Run repository hygiene audit
./scripts/repo-hygiene-audit.sh
```

## 🔄 Workflow Conversion Guide

### Gitea Actions → GitHub Actions

**Key Differences:**
- Gitea uses `gitea.event_name` and `gitea.ref`
- GitHub uses `github.event_name` and `github.ref`
- Gitea uses `actions/checkout@v4`
- GitHub uses `actions/checkout@v4` (same)

**Example Conversion:**
```yaml
# Gitea Actions
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# GitHub Actions (same syntax)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## 🛡️ Security Considerations

### Pre-Migration Security Audit
- [x] No hardcoded secrets in code
- [x] Environment variables properly configured
- [x] Dependencies scanned for vulnerabilities
- [x] Code quality checks in place

### Post-Migration Security Setup
- [ ] Enable GitHub security features
- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Enable secret scanning
- [ ] Set up Dependabot

## 📋 Post-Migration Checklist

- [ ] Repository created in CivicTechWR organization
- [ ] All code pushed to new repository
- [ ] GitHub Actions workflows configured
- [ ] Environment variables set up
- [ ] Branch protection rules enabled
- [ ] Documentation updated
- [ ] Community guidelines in place
- [ ] Issues and discussions enabled
- [ ] Repository is public and accessible
- [ ] All tests passing
- [ ] Build successful

## 🆘 Troubleshooting

### Common Issues

**1. Authentication Issues**
```bash
# Re-authenticate with GitHub
gh auth logout
gh auth login
```

**2. Permission Issues**
- Ensure you have write access to CivicTechWR organization
- Contact organization administrators if needed

**3. Workflow Issues**
- Check GitHub Actions syntax
- Verify environment variables are set
- Check workflow file permissions

**4. Build Issues**
- Run `npm run build` locally first
- Check for missing dependencies
- Verify environment variable configuration

## 📞 Support

For migration support:
- Create an issue in the new repository
- Contact CivicTechWR organization administrators
- Check the [CivicTechWR documentation](https://github.com/civicTechWR)

## 🎉 Success Criteria

Migration is complete when:
- ✅ Repository is accessible at `https://github.com/civicTechWR/go-train-group-pass`
- ✅ All workflows are running successfully
- ✅ Build passes without errors
- ✅ Security scans are enabled
- ✅ Documentation is up to date
- ✅ Community guidelines are in place

---

**Next Steps:** After successful migration, the original Gitea repository can be archived or deleted as needed.
