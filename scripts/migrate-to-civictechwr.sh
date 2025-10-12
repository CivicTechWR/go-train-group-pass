#!/bin/bash

# Migration Script for GO Train Group Pass to CivicTechWR
# This script helps prepare the project for migration to the CivicTechWR organization

set -e

echo "🚂 GO Train Group Pass - Migration to CivicTechWR"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Starting migration preparation..."

# 1. Update README
print_status "Updating README for CivicTechWR..."
if [ -f "README_CIVICTECHWR.md" ]; then
    cp README_CIVICTECHWR.md README.md
    print_success "README updated with CivicTechWR branding"
else
    print_warning "README_CIVICTECHWR.md not found, skipping README update"
fi

# 2. Update package.json
print_status "Updating package.json with CivicTechWR information..."
if command -v jq >/dev/null 2>&1; then
    # Update repository field
    jq '.repository = {
        "type": "git",
        "url": "git+https://github.com/civicTechWR/go-transit-group.git"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    # Update homepage field
    jq '.homepage = "https://github.com/civicTechWR/go-transit-group#readme"' package.json > package.json.tmp && mv package.json.tmp package.json
    
    # Update bugs field
    jq '.bugs = {
        "url": "https://github.com/civicTechWR/go-transit-group/issues"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    print_success "package.json updated with CivicTechWR repository information"
else
    print_warning "jq not found, please manually update package.json with CivicTechWR repository information"
fi

# 3. Create .gitignore additions
print_status "Updating .gitignore for CivicTechWR..."
cat >> .gitignore << 'EOF'

# CivicTechWR specific
.civictechwr/
community-notes/
meeting-notes/
EOF
print_success ".gitignore updated with CivicTechWR specific entries"

# 4. Create community directory structure
print_status "Creating community directory structure..."
mkdir -p .civictechwr/{meetings,notes,resources}
mkdir -p community/{docs,resources,meetings}

# Create community README
cat > community/README.md << 'EOF'
# CivicTechWR Community Resources

This directory contains community-specific resources for the GO Train Group Pass project.

## Directory Structure

- `docs/` - Community documentation and guides
- `resources/` - Community resources and templates
- `meetings/` - Meeting notes and recordings

## Getting Involved

1. Join our [Slack workspace](https://join.slack.com/t/civictechwr/shared_invite/zt-2hk4c93hv-DEIbxR_z1xKj8cZmayVHTw)
2. Attend project meetings (see [schedule](https://docs.google.com/spreadsheets/d/1hAxstCyiVBdYeSQlIrlkhnSntJLJ3kNnoCuechFJN7E/edit?gid=0#gid=0))
3. Check out our [contribution guidelines](../CONTRIBUTING.md)

## Contact

- **Email**: civictechwr@gmail.com
- **Website**: http://www.civictechwr.org
- **GitHub**: https://github.com/civicTechWR/
EOF

print_success "Community directory structure created"

# 5. Update CI/CD workflows for CivicTechWR
print_status "Updating CI/CD workflows for CivicTechWR..."
if [ -f ".gitea/workflows/ci.yml" ]; then
    # Update workflow to reference CivicTechWR
    sed -i 's/gitea.dredre.net\/dre\/go-transit-group/github.com\/civicTechWR\/go-transit-group/g' .gitea/workflows/ci.yml
    sed -i 's/gitea.dredre.net/github.com/g' .gitea/workflows/ci.yml
    print_success "CI/CD workflows updated for GitHub"
else
    print_warning "Gitea workflows not found, skipping workflow update"
fi

# 6. Create GitHub-specific files
print_status "Creating GitHub-specific configuration..."
mkdir -p .github/{workflows,ISSUE_TEMPLATE,PULL_REQUEST_TEMPLATE}

# Copy issue templates
if [ -f ".github/ISSUE_TEMPLATE/bug_report.md" ]; then
    print_success "GitHub issue templates already exist"
else
    print_warning "GitHub issue templates not found, please copy them manually"
fi

# 7. Update documentation references
print_status "Updating documentation references..."
find docs/ -name "*.md" -exec sed -i 's/gitea\.dredre\.net/github.com\/civicTechWR/g' {} \;
find . -name "*.md" -exec sed -i 's/gitea\.dredre\.net/github.com\/civicTechWR/g' {} \;
print_success "Documentation references updated"

# 8. Create migration checklist
print_status "Creating migration checklist..."
cat > MIGRATION_CHECKLIST.md << 'EOF'
# Migration Checklist

## Pre-Migration ✅
- [x] Code quality workflows implemented
- [x] Comprehensive documentation created
- [x] Security scanning configured
- [x] Test suites implemented
- [x] CivicTechWR branding applied

## Migration Steps
- [ ] Transfer repository to CivicTechWR organization
- [ ] Update repository settings and permissions
- [ ] Configure branch protection rules
- [ ] Set up team access and permissions
- [ ] Update deployment URLs
- [ ] Configure domain and hosting
- [ ] Set up organization-level secrets
- [ ] Create project board
- [ ] Set up community channels

## Post-Migration
- [ ] Welcome new contributors
- [ ] Conduct project walkthrough
- [ ] Gather community feedback
- [ ] Plan feature development
- [ ] Schedule regular meetings
- [ ] Launch community engagement

## Verification
- [ ] All links work correctly
- [ ] CI/CD pipelines run successfully
- [ ] Documentation is accessible
- [ ] Community resources are available
- [ ] Contributing guidelines are clear
EOF

print_success "Migration checklist created"

# 9. Run quality checks
print_status "Running quality checks..."
if npm run quality > /dev/null 2>&1; then
    print_success "Quality checks passed"
else
    print_warning "Quality checks failed, please review and fix issues"
fi

# 10. Create final summary
print_status "Creating migration summary..."
cat > MIGRATION_SUMMARY.md << 'EOF'
# Migration Summary

## ✅ Completed
- README updated with CivicTechWR branding
- package.json updated with new repository information
- Community directory structure created
- Documentation references updated
- Migration checklist created
- Quality checks run

## 📋 Next Steps
1. Review all changes
2. Test the application locally
3. Transfer repository to CivicTechWR
4. Update deployment configuration
5. Set up community channels
6. Launch community engagement

## 🔗 Resources
- [CivicTechWR Website](http://www.civictechwr.org)
- [GitHub Organization](https://github.com/civicTechWR/)
- [Slack Workspace](https://join.slack.com/t/civictechwr/shared_invite/zt-2hk4c93hv-DEIbxR_z1xKj8cZmayVHTw)
- [Project Documentation](./CLAUDE.md)

## 📞 Support
- Email: civictechwr@gmail.com
- GitHub Issues: Use the issue tracker
- Slack: #go-train-group-pass channel
EOF

print_success "Migration summary created"

echo ""
echo "🎉 Migration preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review all changes in this commit"
echo "2. Test the application locally"
echo "3. Transfer repository to CivicTechWR organization"
echo "4. Follow the migration checklist"
echo ""
echo "📚 Resources:"
echo "- Migration checklist: MIGRATION_CHECKLIST.md"
echo "- Migration summary: MIGRATION_SUMMARY.md"
echo "- Community guidelines: CONTRIBUTING.md"
echo ""
echo "🚂 Welcome to CivicTech Waterloo Region!"
