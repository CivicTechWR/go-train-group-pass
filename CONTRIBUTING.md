# Contributing to GO Train Group Pass

Thank you for your interest in contributing to the GO Train Group Pass Coordination App! This project is part of [CivicTech Waterloo Region](https://github.com/civicTechWR/) and we welcome contributions from community members and external contributors alike.

## 🤝 How to Contribute

### For CivicTechWR Members

1. **Join the Community**
   - Join our [Slack workspace](https://join.slack.com/t/civictechwr/shared_invite/zt-2hk4c93hv-DEIbxR_z1xKj8cZmayVHTw)
   - Attend project meetings (see [schedule](https://docs.google.com/spreadsheets/d/1hAxstCyiVBdYeSQlIrlkhnSntJLJ3kNnoCuechFJN7E/edit?gid=0#gid=0))
   - Introduce yourself in the #go-train-group-pass channel

2. **Get Oriented**
   - Read the [project documentation](./CLAUDE.md)
   - Set up your development environment
   - Attend a project walkthrough session

3. **Start Contributing**
   - Pick up a "good first issue" from our issue tracker
   - Ask questions in Slack or during meetings
   - Submit your first pull request

### For External Contributors

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/go-transit-group.git
   cd go-transit-group
   ```

2. **Set Up Development Environment**

   ```bash
   npm install
   cp .env.example .env.local
   # Follow SETUP.md for detailed instructions
   ```

3. **Make Your Changes**
   - Create a feature branch: `git checkout -b feature/your-feature-name`
   - Follow our coding standards
   - Write tests for new functionality
   - Update documentation as needed

4. **Submit a Pull Request**
   - Push your changes: `git push origin feature/your-feature-name`
   - Create a pull request with a clear description
   - Link any related issues

## 📋 Development Process

### Code Standards

We maintain high code quality standards:

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow our comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Testing**: Write tests for new features
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimize for mobile and desktop

### Quality Checks

Before submitting a pull request, ensure:

```bash
npm run quality        # All quality checks
npm run test          # All tests pass
npm run type-check    # TypeScript validation
npm run lint          # Linting passes
npm run format:check  # Prettier validation
```

### Commit Messages

Follow our commit message format:

```
<type>: <short summary> (50 chars or less)

<optional detailed description>

- Key change 1
- Key change 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`

### Pull Request Process

1. **Create a Draft PR** for work in progress
2. **Request Review** when ready for feedback
3. **Address Feedback** promptly and professionally
4. **Merge** after approval and CI checks pass

## 🎯 Areas for Contribution

### High Priority

- **Accessibility Improvements**: Screen reader support, keyboard navigation
- **Mobile Optimization**: Touch interactions, responsive design
- **Performance**: Bundle size optimization, loading times
- **Testing**: Increase test coverage, add E2E tests
- **Documentation**: User guides, API documentation

### Medium Priority

- **New Features**: Additional group coordination features
- **UI/UX**: Design improvements, user experience enhancements
- **Integration**: GO Transit API integration, real-time updates
- **Internationalization**: Multi-language support
- **Analytics**: Usage tracking and insights

### Low Priority

- **Code Refactoring**: Improve code organization and maintainability
- **DevOps**: CI/CD improvements, deployment automation
- **Monitoring**: Error tracking, performance monitoring
- **Security**: Additional security measures and audits

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Browser, OS, device type
4. **Screenshots**: If applicable
5. **Console Logs**: Any error messages

### Feature Requests

For new features, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Use Cases**: Who would benefit and how?
4. **Alternatives**: Other solutions you've considered

## 💬 Communication

### Slack Channels

- **#go-train-group-pass**: General project discussion
- **#go-train-dev**: Development and technical questions
- **#go-train-ux**: Design and user experience feedback

### Meetings

- **Project Meetings**: Weekly (see [schedule](https://docs.google.com/spreadsheets/d/1hAxstCyiVBdYeSQlIrlkhnSntJLJ3kNnoCuechFJN7E/edit?gid=0#gid=0))
- **Code Reviews**: As needed for pull requests
- **Planning Sessions**: Monthly feature planning

### Code of Conduct

We follow the [CivicTechWR Code of Conduct](https://github.com/civicTechWR/CTWR-Organization-Documentation):

- **Be Respectful**: Treat everyone with dignity and respect
- **Be Inclusive**: Welcome diverse perspectives and backgrounds
- **Be Collaborative**: Work together toward common goals
- **Be Constructive**: Provide helpful feedback and suggestions

## 🏗️ Project Architecture

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Zustand**: State management

### Backend

- **tRPC**: Type-safe API layer
- **Supabase**: Database and authentication
- **PostgreSQL**: Data storage
- **Row Level Security**: Data protection

### Quality Assurance

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Playwright**: E2E testing
- **Jest**: Unit testing
- **Lighthouse**: Performance testing

## 📚 Resources

### Documentation

- [Project Specification](./CLAUDE.md)
- [Setup Guide](./SETUP.md)
- [API Documentation](./docs/API.md)
- [Workflow Documentation](./docs/WORKFLOWS.md)

### External Resources

- [CivicTechWR Website](http://www.civictechwr.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [tRPC Documentation](https://trpc.io/docs)

### Tools

- [GitHub Issues](https://github.com/civicTechWR/go-transit-group/issues)
- [Project Board](https://github.com/civicTechWR/go-transit-group/projects)
- [Discussions](https://github.com/civicTechWR/go-transit-group/discussions)

## 🙏 Recognition

Contributors will be recognized in:

- **README**: Listed as contributors
- **Release Notes**: Featured in changelog
- **CivicTechWR**: Highlighted in community updates
- **GitHub**: Automatically tracked in contributions

## 📞 Getting Help

### Technical Questions

- **Slack**: #go-train-dev channel
- **GitHub Issues**: Use the issue tracker
- **Code Reviews**: Ask questions in PR comments

### General Questions

- **Slack**: #go-train-group-pass channel
- **Email**: civictechwr@gmail.com
- **Meetings**: Attend project meetings

### Mentorship

- **Pair Programming**: Available for complex features
- **Code Reviews**: Detailed feedback on contributions
- **Office Hours**: Regular Q&A sessions

---

**Thank you for contributing to civic technology that serves the Waterloo Region community!**

_Together, we're building better public transit coordination for everyone._
