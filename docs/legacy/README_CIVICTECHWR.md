# GO Train Group Pass Coordination App

[![CivicTechWR](https://img.shields.io/badge/CivicTech-Waterloo%20Region-blue?style=flat-square)](https://github.com/civicTechWR/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)

A modern web application that reduces reliance on WhatsApp threads for GO Train weekday group pass coordination between Kitchener and Union Station. Built by the [CivicTech Waterloo Region](https://github.com/civicTechWR/) community to improve public transit coordination and accessibility.

## 🎯 Mission

**Empowering Waterloo Region commuters** to coordinate GO Train group passes efficiently, reducing costs and improving the daily commute experience through technology.

## 🚀 Project Status

**Phase 1 Complete**: Foundation and core features implemented

- ✅ Next.js 15 with TypeScript
- ✅ tRPC 11 for type-safe API
- ✅ Supabase setup (client + server)
- ✅ Phone-based authentication
- ✅ Group formation algorithm
- ✅ Steward workflow with OCR
- ✅ Comprehensive quality assurance
- ✅ CI/CD pipelines

**Phase 2 In Progress**: Community integration and feature enhancement

## 🌟 Key Features

### For Commuters

- **Real-time Group Formation**: Automatic optimal group balancing
- **Instant Updates**: Live notifications when groups change
- **Mobile-First Design**: Optimized for smartphone use
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### For Stewards

- **OCR Pass Upload**: Automatic ticket number extraction
- **Payment Tracking**: Real-time payment status monitoring
- **Group Management**: Easy member coordination
- **Cost Optimization**: Automatic group size balancing

### For the Community

- **Open Source**: Fully transparent and community-driven
- **Local Impact**: Built specifically for Waterloo Region
- **Civic Engagement**: Empowers citizens to improve public transit

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SETUP.md](./SETUP.md) to:

1. Create a Supabase project
2. Configure your database schema
3. Add environment variables

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Project Structure

```
app/                    # Next.js App Router
  (auth)/login/        # Authentication pages
  api/trpc/           # tRPC API endpoint
  steward/            # Steward dashboard
  today-demo/         # Train schedule display
  layout.tsx          # Root layout with providers

server/                # Backend logic
  trpc.ts             # tRPC setup + context
  routers/
    _app.ts           # Main router
    trips.ts          # Trips CRUD + group formation
    steward.ts        # Steward operations

lib/                   # Shared utilities
  group-formation.ts  # Group balancing algorithm
  supabase/           # Supabase clients
  trpc/               # tRPC client + provider
  validations.ts      # Input validation schemas

components/           # React components
  auth/               # Authentication components
  steward/            # Steward-specific components
  trips/              # Trip display components
  ui/                 # Reusable UI components
```

## 🧪 Quality Assurance

This project maintains high quality standards with:

- **Comprehensive Linting**: ESLint, Prettier, TypeScript
- **Accessibility Testing**: axe-core integration
- **Performance Monitoring**: Lighthouse CI
- **Security Scanning**: Dependency and code analysis
- **Test Coverage**: Unit, integration, and E2E tests

Run quality checks locally:

```bash
npm run quality        # All quality checks
npm run test          # Run all tests
npm run lighthouse    # Performance testing
npm run security      # Security audit
```

## 🤝 Contributing

We welcome contributions from the CivicTechWR community and beyond!

### For CivicTechWR Members

1. Join our [Slack workspace](https://join.slack.com/t/civictechwr/shared_invite/zt-2hk4c93hv-DEIbxR_z1xKj8cZmayVHTw)
2. Attend project meetings (see [schedule](https://docs.google.com/spreadsheets/d/1hAxstCyiVBdYeSQlIrlkhnSntJLJ3kNnoCuechFJN7E/edit?gid=0#gid=0))
3. Check out our [contribution guidelines](./CONTRIBUTING.md)

### For External Contributors

1. Fork the repository
2. Create a feature branch
3. Follow our coding standards
4. Submit a pull request

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete project specification
- [SETUP.md](./SETUP.md) - Development setup guide
- [WORKFLOWS.md](./docs/WORKFLOWS.md) - CI/CD pipeline documentation
- [MIGRATION_TO_CIVICTECHWR.md](./MIGRATION_TO_CIVICTECHWR.md) - Migration details

## 🏛️ CivicTechWR

This project is part of [CivicTech Waterloo Region](https://github.com/civicTechWR/), a community organization dedicated to building civic technology that serves the Waterloo Region community.

### Connect with Us

- **Website**: [civictechwr.org](http://www.civictechwr.org)
- **GitHub**: [github.com/civicTechWR](https://github.com/civicTechWR/)
- **Slack**: [join.slack.com/t/civictechwr](https://join.slack.com/t/civictechwr/shared_invite/zt-2hk4c93hv-DEIbxR_z1xKj8cZmayVHTw)
- **Meetup**: [meetup.com/civictechwr](https://www.meetup.com/civictechwr)
- **Email**: civictechwr@gmail.com

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **API:** tRPC 11
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Twilio SMS
- **Real-time:** Supabase Realtime
- **Testing:** Playwright, Jest
- **Quality:** ESLint, Prettier, Lighthouse

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CivicTechWR Community**: For fostering civic technology development
- **GO Transit Commuters**: For providing feedback and requirements
- **Open Source Contributors**: For the amazing tools and libraries we use
- **Waterloo Region**: For being an innovative community that supports civic tech

---

**Built with ❤️ for the Waterloo Region community by CivicTechWR**

_Improving public transit, one group pass at a time._
