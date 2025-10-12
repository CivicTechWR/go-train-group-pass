# GO Train Group Pass - CI/CD Workflows

This document describes the comprehensive CI/CD pipeline and quality assurance workflows for the GO Train Group Pass application.

## Overview

The project uses Gitea Actions for continuous integration and deployment, with multiple specialized workflows for different aspects of code quality and testing.

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Purpose**: Core build, test, and deployment pipeline

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs**:

- **Lint & Type Check**: ESLint, Prettier, TypeScript validation
- **Build**: Next.js application build
- **Test**: Basic test execution
- **Docker Build**: Container image creation (when applicable)
- **Deploy Dev**: Deploy to development environment (develop branch)
- **Deploy Prod**: Deploy to production environment (main branch)
- **Notify Completion**: Summary report generation

### 2. Quality Assurance Pipeline (`quality.yml`)

**Purpose**: Comprehensive code quality, accessibility, and performance testing

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs**:

- **Linting**: Enhanced code quality checks
  - ESLint with comprehensive rules
  - Prettier formatting validation
  - TypeScript type checking
  - Security audit (npm audit)
  - Import organization validation
  - Unused imports detection

- **Accessibility**: Web accessibility testing
  - axe-core integration with Playwright
  - Automated accessibility scanning
  - WCAG compliance checking
  - Screen reader compatibility testing

- **Performance**: Performance monitoring
  - Lighthouse CI integration
  - Core Web Vitals measurement
  - Load time testing
  - Bundle size analysis
  - Performance regression detection

- **Bundle Analysis**: JavaScript bundle optimization
  - Bundle size monitoring
  - Dependency analysis
  - Code splitting validation
  - Tree shaking verification

### 3. Security Pipeline (`security.yml`)

**Purpose**: Security vulnerability scanning and code security analysis

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Daily scheduled runs (2 AM UTC)
- Manual workflow dispatch

**Jobs**:

- **Dependency Scan**: Package vulnerability detection
  - npm audit with severity levels
  - Outdated package detection
  - Security advisory checking
  - License compliance validation

- **Code Security**: Source code security analysis
  - Hardcoded secret detection
  - Console.log statement auditing
  - TODO comment tracking
  - Security anti-pattern detection

### 4. Test Suite (`tests.yml`)

**Purpose**: Comprehensive testing across multiple levels

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs**:

- **Unit Tests**: Isolated component testing
  - Jest test framework
  - Group formation algorithm tests
  - Validation schema tests
  - Utility function tests
  - Code coverage reporting

- **Integration Tests**: API and database testing
  - API endpoint testing
  - Database operation validation
  - Service integration testing
  - External dependency mocking

- **E2E Tests**: End-to-end user flow testing
  - Playwright browser automation
  - User journey testing
  - Cross-browser compatibility
  - Mobile device testing

## Configuration Files

### ESLint Configuration (`.eslintrc.json`)

Comprehensive linting rules including:

- TypeScript-specific rules
- React and React Hooks rules
- Accessibility rules (jsx-a11y)
- Import organization
- Unused code detection
- Prettier integration

### Prettier Configuration (`.prettierrc`)

Code formatting standards:

- Single quotes for strings
- Semicolons required
- 80 character line width
- 2-space indentation
- Trailing commas in ES5

### Lighthouse Configuration (`lighthouse.config.js`)

Performance and accessibility thresholds:

- Performance: 80+ score
- Accessibility: 90+ score
- Best Practices: 80+ score
- SEO: 80+ score
- PWA: 60+ score

### Playwright Configuration (`playwright.config.ts`)

Browser testing setup:

- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Parallel test execution
- Screenshot on failure
- Trace collection for debugging

## Quality Gates

### Linting Standards

- ✅ No ESLint errors
- ✅ Prettier formatting compliance
- ✅ TypeScript type safety
- ✅ No unused imports
- ✅ Proper import organization

### Accessibility Standards

- ✅ WCAG 2.1 AA compliance
- ✅ No axe-core violations
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility

### Performance Standards

- ✅ First Contentful Paint < 2s
- ✅ Largest Contentful Paint < 4s
- ✅ Cumulative Layout Shift < 0.1
- ✅ Total Blocking Time < 300ms
- ✅ Speed Index < 3s

### Security Standards

- ✅ No critical vulnerabilities
- ✅ No high-severity issues
- ✅ No hardcoded secrets
- ✅ Minimal console.log usage
- ✅ Reasonable TODO count

### Test Coverage

- ✅ Unit test coverage > 80%
- ✅ Integration test coverage > 70%
- ✅ E2E test coverage > 60%
- ✅ All critical paths tested

## Local Development

### Running Quality Checks Locally

```bash
# Run all quality checks
npm run quality

# Run individual checks
npm run lint              # ESLint
npm run lint:fix          # ESLint with auto-fix
npm run format            # Prettier formatting
npm run format:check      # Prettier validation
npm run type-check        # TypeScript checking
npm run security          # Security audit

# Run tests
npm run test              # All tests
npm run test:ui           # Playwright UI mode
npm run test:headed       # Headed browser tests
npm run test:debug        # Debug mode

# Performance analysis
npm run lighthouse        # Lighthouse CI
npm run analyze           # Bundle analysis
```

### Pre-commit Hooks

Recommended pre-commit setup:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run quality"
```

## Workflow Reports

Each workflow generates detailed reports including:

### Summary Tables

- Job status overview
- Pass/fail indicators
- Performance metrics
- Security findings

### Detailed Logs

- Step-by-step execution logs
- Error messages and stack traces
- Performance measurements
- Test results

### Artifacts

- Test coverage reports
- Bundle analysis results
- Screenshots and videos (E2E tests)
- Performance traces

## Troubleshooting

### Common Issues

1. **Linting Failures**
   - Run `npm run lint:fix` to auto-fix issues
   - Check ESLint configuration for rule conflicts
   - Verify Prettier integration

2. **TypeScript Errors**
   - Run `npm run type-check` for detailed errors
   - Check import paths and type definitions
   - Verify tsconfig.json configuration

3. **Test Failures**
   - Check test environment setup
   - Verify test data and mocks
   - Review test timeout settings

4. **Performance Issues**
   - Analyze bundle size with `npm run analyze`
   - Check for large dependencies
   - Review code splitting implementation

5. **Security Warnings**
   - Update vulnerable dependencies
   - Remove hardcoded secrets
   - Review security audit results

### Getting Help

- Check workflow logs in Gitea Actions
- Review configuration files
- Consult team documentation
- Create issue for persistent problems

## Best Practices

### Code Quality

- Write clean, readable code
- Follow established patterns
- Use TypeScript strictly
- Keep functions small and focused

### Testing

- Write tests for new features
- Maintain test coverage
- Use descriptive test names
- Test edge cases and error conditions

### Performance

- Monitor bundle size
- Optimize images and assets
- Use code splitting
- Implement lazy loading

### Security

- Keep dependencies updated
- Never commit secrets
- Use environment variables
- Follow security guidelines

## Continuous Improvement

The workflows are designed to be:

- **Extensible**: Easy to add new checks
- **Configurable**: Adjustable thresholds and rules
- **Maintainable**: Clear structure and documentation
- **Reliable**: Consistent and predictable results

Regular review and updates ensure the workflows remain effective and aligned with project goals.
