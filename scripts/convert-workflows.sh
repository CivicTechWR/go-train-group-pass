#!/bin/bash

# Convert Gitea Actions workflows to GitHub Actions format
# This script converts workflow files from .gitea/workflows/ to .github/workflows/

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Create .github/workflows directory
create_github_workflows_dir() {
    print_status "Creating .github/workflows directory..."
    mkdir -p .github/workflows
    print_success "Directory created"
}

# Convert a single workflow file
convert_workflow() {
    local input_file="$1"
    local output_file="$2"
    
    print_status "Converting $input_file to $output_file..."
    
    # Copy the file
    cp "$input_file" "$output_file"
    
    # Convert Gitea-specific syntax to GitHub Actions
    sed -i 's/gitea\.event_name/github.event_name/g' "$output_file"
    sed -i 's/gitea\.ref/github.ref/g' "$output_file"
    sed -i 's/gitea\.repository/github.repository/g' "$output_file"
    sed -i 's/gitea\.actor/github.actor/g' "$output_file"
    sed -i 's/gitea\.sha/github.sha/g' "$output_file"
    
    # Convert Gitea Actions to GitHub Actions
    sed -i 's/uses: actions\/checkout@v4/uses: actions\/checkout@v4/g' "$output_file"
    
    # Update workflow triggers if needed
    # Gitea and GitHub use similar syntax, but we might need to adjust some specifics
    
    print_success "Converted $input_file"
}

# Convert all workflow files
convert_all_workflows() {
    print_status "Converting all workflow files..."
    
    if [ ! -d ".gitea/workflows" ]; then
        print_warning "No .gitea/workflows directory found"
        return 0
    fi
    
    # Find all .yml and .yaml files in .gitea/workflows
    find .gitea/workflows -name "*.yml" -o -name "*.yaml" | while read -r file; do
        # Get filename without path
        filename=$(basename "$file")
        
        # Convert to GitHub Actions format
        convert_workflow "$file" ".github/workflows/$filename"
    done
    
    print_success "All workflows converted"
}

# Validate converted workflows
validate_workflows() {
    print_status "Validating converted workflows..."
    
    # Check if any workflows were converted
    if [ ! -d ".github/workflows" ] || [ -z "$(ls -A .github/workflows)" ]; then
        print_warning "No workflows found in .github/workflows"
        return 0
    fi
    
    # Basic validation - check for common issues
    for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [ -f "$workflow" ]; then
            # Check for Gitea-specific references that might have been missed
            if grep -q "gitea\." "$workflow"; then
                print_warning "Found Gitea-specific references in $workflow"
            fi
            
            # Check for proper GitHub Actions syntax
            if ! grep -q "uses: actions/" "$workflow"; then
                print_warning "No GitHub Actions found in $workflow"
            fi
        fi
    done
    
    print_success "Workflow validation complete"
}

# Main execution
main() {
    echo
    print_status "Converting Gitea Actions workflows to GitHub Actions format..."
    echo
    
    create_github_workflows_dir
    convert_all_workflows
    validate_workflows
    
    echo
    print_success "🎉 Workflow conversion completed!"
    echo
    print_status "Converted workflows:"
    ls -la .github/workflows/ 2>/dev/null || print_warning "No workflows found"
    echo
    print_status "Next steps:"
    echo "1. Review converted workflows in .github/workflows/"
    echo "2. Test workflows in GitHub Actions"
    echo "3. Update any organization-specific references"
    echo "4. Commit and push changes"
    echo
}

# Run main function
main "$@"
