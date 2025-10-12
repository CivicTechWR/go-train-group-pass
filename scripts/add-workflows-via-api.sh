#!/bin/bash

# Add GitHub Actions workflows via API to avoid OAuth scope issues
# This script uploads workflow files directly to the repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ORG_NAME="CivicTechWR"
REPO_NAME="go-train-group-pass"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Add a workflow file via API
add_workflow() {
    local workflow_file="$1"
    local workflow_name=$(basename "$workflow_file")
    
    print_status "Adding workflow: $workflow_name"
    
    # Read the workflow content
    local content=$(cat "$workflow_file" | base64 -w 0)
    
    # Create the workflow file via API
    gh api repos/$ORG_NAME/$REPO_NAME/contents/.github/workflows/$workflow_name \
        --method PUT \
        --field message="Add $workflow_name workflow" \
        --field content="$content" \
        --field branch="main" > /dev/null
    
    print_success "Added $workflow_name"
}

# Main execution
main() {
    echo
    print_status "Adding GitHub Actions workflows via API..."
    echo
    
    # Check if workflows directory exists
    if [ ! -d ".github/workflows" ]; then
        print_error "No .github/workflows directory found"
        exit 1
    fi
    
    # Add each workflow file
    for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [ -f "$workflow" ]; then
            add_workflow "$workflow"
        fi
    done
    
    echo
    print_success "🎉 All workflows added successfully!"
    echo
    print_status "Workflows are now available at:"
    echo "https://github.com/$ORG_NAME/$REPO_NAME/actions"
    echo
}

# Run main function
main "$@"
