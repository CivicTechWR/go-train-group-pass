#!/bin/bash

# Migration script for GO Train Group Pass App to CivicTechWR organization
# This script helps automate the migration process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORG_NAME="civicTechWR"
REPO_NAME="go-train-group-pass"
REPO_DESCRIPTION="GO Train weekday group pass coordination app - replaces WhatsApp-based coordination"
REPO_HOMEPAGE="https://github.com/$ORG_NAME/$REPO_NAME"

echo -e "${BLUE}🚀 GO Train Group Pass App Migration to CivicTechWR${NC}"
echo "=================================================="

# Function to print status
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

# Check if gh command is available
check_gh_command() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed. Please install it first:"
        echo "  On Fedora/CentOS/RHEL: sudo dnf install -y gh"
        echo "  On Ubuntu/Debian: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
        echo "  Then: gh auth login"
        exit 1
    fi
    print_success "GitHub CLI is available"
}

# Check authentication
check_authentication() {
    print_status "Checking GitHub authentication..."
    
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub. Please run: gh auth login"
        exit 1
    fi
    
    print_success "Authenticated with GitHub"
}

# Check organization access
check_organization_access() {
    print_status "Checking access to CivicTechWR organization..."
    
    if ! gh api orgs/$ORG_NAME &> /dev/null; then
        print_error "Cannot access CivicTechWR organization. Please ensure you have the necessary permissions."
        exit 1
    fi
    
    print_success "Access to CivicTechWR organization confirmed"
}

# Check if repository already exists
check_repository_exists() {
    print_status "Checking if repository already exists..."
    
    if gh repo view $ORG_NAME/$REPO_NAME &> /dev/null; then
        print_warning "Repository $ORG_NAME/$REPO_NAME already exists"
        read -p "Do you want to continue? This will add a new remote. (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Migration cancelled"
            exit 0
        fi
    else
        print_success "Repository does not exist, will create new one"
    fi
}

# Create repository
create_repository() {
    print_status "Creating repository $ORG_NAME/$REPO_NAME..."
    
    if ! gh repo view $ORG_NAME/$REPO_NAME &> /dev/null; then
        gh repo create $ORG_NAME/$REPO_NAME \
            --public \
            --description "$REPO_DESCRIPTION" \
            --homepage "$REPO_HOMEPAGE" \
            --add-readme=false
        
        print_success "Repository created successfully"
    else
        print_status "Repository already exists, skipping creation"
    fi
}

# Add remote
add_remote() {
    print_status "Adding GitHub remote..."
    
    # Check if remote already exists
    if git remote get-url civictech &> /dev/null; then
        print_status "Remote 'civictech' already exists, updating URL..."
        git remote set-url civictech https://github.com/$ORG_NAME/$REPO_NAME.git
    else
        git remote add civictech https://github.com/$ORG_NAME/$REPO_NAME.git
    fi
    
    print_success "Remote added successfully"
}

# Push to new repository
push_to_github() {
    print_status "Pushing code to GitHub repository..."
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_status "Current branch: $CURRENT_BRANCH"
    
    # Push main branch
    print_status "Pushing main branch..."
    git push civictech $CURRENT_BRANCH
    
    # Push all tags
    print_status "Pushing tags..."
    git push civictech --tags
    
    # Push other branches if they exist
    print_status "Pushing other branches..."
    for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///'); do
        if [ "$branch" != "$CURRENT_BRANCH" ]; then
            print_status "Pushing branch: $branch"
            git push civictech origin/$branch:$branch || print_warning "Failed to push branch $branch"
        fi
    done
    
    print_success "Code pushed successfully"
}

# Copy workflows
copy_workflows() {
    print_status "Copying workflows to GitHub Actions format..."
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    # Copy Gitea workflows to GitHub Actions
    if [ -d ".gitea/workflows" ]; then
        cp .gitea/workflows/*.yml .github/workflows/ 2>/dev/null || true
        print_success "Workflows copied to .github/workflows/"
    else
        print_warning "No .gitea/workflows directory found"
    fi
}

# Update package.json
update_package_json() {
    print_status "Updating package.json for new repository..."
    
    # Backup original
    cp package.json package.json.backup
    
    # Update repository information
    jq --arg repo "https://github.com/$ORG_NAME/$REPO_NAME.git" \
       --arg bugs "https://github.com/$ORG_NAME/$REPO_NAME/issues" \
       --arg homepage "https://github.com/$ORG_NAME/$REPO_NAME#readme" \
       --arg name "@civictechwr/go-train-group-pass" \
       '.name = $name | .repository = {"type": "git", "url": $repo} | .bugs = {"url": $bugs} | .homepage = $homepage' \
       package.json > package.json.tmp && mv package.json.tmp package.json
    
    print_success "package.json updated"
}

# Commit changes
commit_changes() {
    print_status "Committing migration changes..."
    
    git add .
    git commit -m "chore: prepare for migration to CivicTechWR organization

- Add migration guide and scripts
- Update package.json for new repository
- Copy workflows to GitHub Actions format
- Update documentation references

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>" || print_warning "No changes to commit"
    
    print_success "Changes committed"
}

# Verify migration
verify_migration() {
    print_status "Verifying migration..."
    
    # Check if remote is accessible
    if git ls-remote civictech &> /dev/null; then
        print_success "Remote repository is accessible"
    else
        print_error "Cannot access remote repository"
        exit 1
    fi
    
    # Check repository URL
    REPO_URL=$(git remote get-url civictech)
    print_status "Repository URL: $REPO_URL"
    
    print_success "Migration verification complete"
}

# Main execution
main() {
    echo
    print_status "Starting migration process..."
    echo
    
    check_gh_command
    check_authentication
    check_organization_access
    check_repository_exists
    create_repository
    add_remote
    copy_workflows
    update_package_json
    commit_changes
    push_to_github
    verify_migration
    
    echo
    print_success "🎉 Migration completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Visit: https://github.com/$ORG_NAME/$REPO_NAME"
    echo "2. Set up environment variables in repository settings"
    echo "3. Enable GitHub Actions workflows"
    echo "4. Configure branch protection rules"
    echo "5. Update any external references to the new repository"
    echo
    print_status "Repository is now available at:"
    echo "https://github.com/$ORG_NAME/$REPO_NAME"
    echo
}

# Run main function
main "$@"
