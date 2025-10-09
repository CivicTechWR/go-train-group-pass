# Available Claude Code Agents

This project has access to 20+ specialized agents for development tasks.

## Project-Specific Agents

Located in `agents/` (project-local):

- **go-train-algorithm-specialist** - Group formation optimization and cost distribution
- **go-train-payment-tracker** - Payment tracking and e-Transfer workflow

Located in `~/.claude/agents/` (global, project-specific):

- **go-train-fullstack** - End-to-end feature development (UI → API → Database)
- **go-train-realtime** - Supabase Realtime subscriptions and notifications

## Core Development Agents

- **fullstack-developer** - Full-stack application development
- **api-designer** - API design and REST/GraphQL endpoint architecture
- **web-design-specialist** - UI/UX design and frontend styling

## Quality & Testing Agents

- **code-reviewer** - Code quality review and best practices enforcement
- **qa-expert** - Test strategy, test case design, and quality assurance
- **test-automator** - Automated test implementation (unit, integration, E2E)
- **debugger** - Issue diagnosis and debugging assistance

## Infrastructure & Platform Agents

- **platform-engineer** - Infrastructure, deployment, and platform engineering
- **devops-engineer** - CI/CD pipelines, automation, and DevOps practices
- **database-administrator** - Database design, optimization, and administration

## Specialized Domain Agents

- **docker-container-expert** - Docker, containerization, and orchestration
- **linux-sysadmin** - Linux system administration and server management
- **python-file-pipeline-expert** - Python file processing and ETL pipelines
- **stagearr-devops** - Stagearr v2 project maintenance (project-specific)

## Home Infrastructure Agents

- **home-assistant-expert** - Home Assistant configuration and automation
- **opnsense-security-expert** - OPNsense firewall and network security
- **junos-network-admin** - Juniper JunOS and network administration
- **media-server-expert** - Plex, Jellyfin, *arr suite management

## How Agents Work

Agents are automatically available to Claude Code. You can:

1. **Invoke explicitly**: `@fullstack-developer implement user authentication`
2. **Let Claude decide**: Describe your task naturally, and Claude will select appropriate agents
3. **Check agent descriptions**: Read agent markdown files for capabilities

## Agent Selection Guidelines

| Task Type | Recommended Agent |
|-----------|------------------|
| New feature (UI + API + DB) | `@go-train-fullstack` or `@fullstack-developer` |
| Real-time updates | `@go-train-realtime` |
| Group algorithm changes | `@go-train-algorithm-specialist` |
| Payment workflow | `@go-train-payment-tracker` |
| API design | `@api-designer` |
| Code review | `@code-reviewer` |
| Testing | `@qa-expert` or `@test-automator` |
| Database schema | `@database-administrator` |
| Deployment/CI/CD | `@devops-engineer` or `@platform-engineer` |
| Debugging issues | `@debugger` |

## Adding More Agents

To add agents:

1. Browse: https://github.com/VoltAgent/awesome-claude-code-subagents
2. Copy agent `.md` files to `~/.claude/agents/`
3. Restart Claude Code or reload window
4. Agents become automatically available

## Source

Most agents from [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - a collection of 100+ production-ready Claude Code agents.
