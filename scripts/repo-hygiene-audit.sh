#!/bin/bash

# Repository Hygiene Audit Script
# This script performs a comprehensive audit of repository hygiene before migration

set -e

echo "🧹 Repository Hygiene Audit"
echo "=========================="
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

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_status "Running: $check_name"
    
    if eval "$check_command"; then
        print_success "$check_name - PASSED"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            print_error "$check_name - FAILED (Critical)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        else
            print_warning "$check_name - WARNING"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            return 0
        fi
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Starting repository hygiene audit..."

# 1. File Structure Checks
echo ""
echo "📁 File Structure Checks"
echo "========================"

run_check "package.json exists" "[ -f 'package.json' ]" true
run_check "README.md exists" "[ -f 'README.md' ]" true
run_check "LICENSE exists" "[ -f 'LICENSE' ]" true
run_check ".gitignore exists" "[ -f '.gitignore' ]" true
run_check "tsconfig.json exists" "[ -f 'tsconfig.json' ]" true
run_check "Next.js config exists" "[ -f 'next.config.ts' ] || [ -f 'next.config.js' ]" true
run_check "Tailwind config exists" "[ -f 'tailwind.config.ts' ] || [ -f 'tailwind.config.js' ]" true
run_check "PostCSS config exists" "[ -f 'postcss.config.mjs' ] || [ -f 'postcss.config.js' ]" true

# 2. Documentation Checks
echo ""
echo "📚 Documentation Checks"
echo "======================="

run_check "CLAUDE.md exists" "[ -f 'CLAUDE.md' ]" true
run_check "SETUP.md exists" "[ -f 'SETUP.md' ]" true
run_check "CONTRIBUTING.md exists" "[ -f 'CONTRIBUTING.md' ]" true
run_check "docs/ directory exists" "[ -d 'docs' ]" true
run_check "docs/WORKFLOWS.md exists" "[ -f 'docs/WORKFLOWS.md' ]" true

# 3. Configuration Checks
echo ""
echo "⚙️ Configuration Checks"
echo "======================="

run_check ".eslintrc.json exists" "[ -f '.eslintrc.json' ]" true
run_check ".prettierrc exists" "[ -f '.prettierrc' ]" true
run_check ".prettierignore exists" "[ -f '.prettierignore' ]" true
run_check "lighthouse.config.js exists" "[ -f 'lighthouse.config.js' ]" true
run_check "playwright.config.ts exists" "[ -f 'playwright.config.ts' ]" true

# 4. Security Checks
echo ""
echo "🔒 Security Checks"
echo "=================="

run_check "No .env files in repo" "[ ! -f '.env' ] && [ ! -f '.env.local' ] && [ ! -f '.env.production' ]" true
run_check "No secrets in package.json" "! grep -q 'password\|secret\|key\|token' package.json" true
run_check "No hardcoded secrets in code" "! grep -r -i -E 'password\s*=\s*[\"'\''][^\"'\'']{3,}[\"'\'']' --exclude-dir=node_modules --exclude-dir=.git --exclude='*.log' --exclude='*.pack' --exclude='.venv' --exclude='docs' --exclude='*.md' ." true

# 5. Code Quality Checks
echo ""
echo "🎯 Code Quality Checks"
echo "======================"

run_check "No console.log in production code" "[ \$(find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v .git | grep -v .next | xargs grep -c 'console\.log' | awk '{sum += \$1} END {print sum}') -lt 5 ]" false

run_check "No TODO comments in production code" "[ \$(find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v .git | grep -v .next | xargs grep -c -i 'todo\|fixme\|hack' | awk '{sum += \$1} END {print sum}') -lt 10 ]" false

run_check "No debugger statements" "! find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v .git | grep -v .next | xargs grep -l 'debugger' 2>/dev/null" true

run_check "No unused imports" "npm run lint 2>/dev/null | grep -c 'unused' || true" false

# 6. Dependencies Checks
echo ""
echo "📦 Dependencies Checks"
echo "======================"

run_check "package-lock.json exists" "[ -f 'package-lock.json' ]" true
run_check "No vulnerable dependencies" "npm audit --audit-level=high 2>/dev/null | grep -c 'found 0 vulnerabilities' || true" true
run_check "Dependencies are up to date" "[ \$(npm outdated 2>/dev/null | wc -l) -lt 10 ]" false

# 7. Git Hygiene Checks
echo ""
echo "🌿 Git Hygiene Checks"
echo "====================="

run_check "Git repository is clean" "[ \$(git status --porcelain | wc -l) -eq 0 ]" false
run_check "No large files in git" "[ \$(find . -type f -size +10M | grep -v node_modules | grep -v .git | grep -v .next | wc -l) -eq 0 ]" true
run_check "No binary files in git" "[ \$(git ls-files | grep -E '\.(exe|dll|so|dylib|bin)$' | wc -l) -eq 0 ]" false

# 8. Build and Test Checks
echo ""
echo "🏗️ Build and Test Checks"
echo "========================"

run_check "Project builds successfully" "npm run build >/dev/null 2>&1" true
run_check "TypeScript compiles without errors" "npx tsc --noEmit >/dev/null 2>&1" true
run_check "ESLint passes" "npm run lint >/dev/null 2>&1" true
run_check "Prettier formatting is correct" "npm run format:check >/dev/null 2>&1" true

# 9. File Size and Structure Checks
echo ""
echo "📏 File Size and Structure Checks"
echo "================================="

run_check "No files larger than 1MB" "[ \$(find . -type f -size +1M | grep -v node_modules | grep -v .git | wc -l) -eq 0 ]" false
run_check "No empty directories" "[ \$(find . -type d -empty | grep -v node_modules | grep -v .git | wc -l) -eq 0 ]" false
run_check "No duplicate files" "[ \$(find . -type f -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v .git | sort | uniq -d | wc -l) -eq 0 ]" false

# 10. Migration Readiness Checks
echo ""
echo "🚀 Migration Readiness Checks"
echo "============================="

run_check "CivicTechWR README exists" "[ -f 'README_CIVICTECHWR.md' ]" true
run_check "Migration documentation exists" "[ -f 'MIGRATION_TO_CIVICTECHWR.md' ]" true
run_check "Migration script exists" "[ -f 'scripts/migrate-to-civictechwr.sh' ]" true
run_check "GitHub templates exist" "[ -d '.github/ISSUE_TEMPLATE' ]" true
run_check "Community directory exists" "[ -d 'community' ]" true

# 11. Workflow Checks
echo ""
echo "🔄 Workflow Checks"
echo "=================="

run_check "CI/CD workflow exists" "[ -f '.gitea/workflows/ci.yml' ]" true
run_check "Quality workflow exists" "[ -f '.gitea/workflows/quality.yml' ]" true
run_check "Security workflow exists" "[ -f '.gitea/workflows/security.yml' ]" true
run_check "Test workflow exists" "[ -f '.gitea/workflows/tests.yml' ]" true

# 12. Environment and Configuration Checks
echo ""
echo "🌍 Environment and Configuration Checks"
echo "======================================="

run_check ".env.example exists" "[ -f '.env.example' ]" true
run_check "No sensitive data in .env.example" "! grep -q '=.*[a-zA-Z0-9]{20,}' .env.example" true
run_check "Docker configuration exists" "[ -f 'Dockerfile' ]" true

# Generate final report
echo ""
echo "📊 Audit Summary"
echo "================"
echo "Total checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo "Warnings: $WARNING_CHECKS"
echo ""

# Calculate success rate
SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo "Success rate: $SUCCESS_RATE%"

# Determine overall status
if [ $FAILED_CHECKS -eq 0 ]; then
    if [ $WARNING_CHECKS -eq 0 ]; then
        print_success "🎉 Repository hygiene audit PASSED - Ready for migration!"
        echo ""
        echo "✅ All checks passed successfully"
        echo "✅ Repository is ready for migration to CivicTechWR"
        echo "✅ No critical issues found"
        exit 0
    else
        print_warning "⚠️ Repository hygiene audit PASSED with warnings - Ready for migration with review"
        echo ""
        echo "✅ All critical checks passed"
        echo "⚠️ Some warnings found (see above)"
        echo "✅ Repository is ready for migration to CivicTechWR"
        exit 0
    fi
else
    print_error "❌ Repository hygiene audit FAILED - Not ready for migration"
    echo ""
    echo "❌ Critical issues found (see above)"
    echo "❌ Repository is NOT ready for migration"
    echo "❌ Please fix critical issues before migrating"
    exit 1
fi
