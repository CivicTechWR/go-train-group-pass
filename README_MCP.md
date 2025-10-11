# MCP Servers - Quick Reference

## 🚀 Quick Start

```bash
# Install all MCP servers
./scripts/setup-all-mcp-servers.sh

# Verify health
./scripts/verify-mcp-health.sh

# List configured servers
claude mcp list
```

## 📦 Installed Servers (13 total)

### Core (5)
| Server | Purpose | Package |
|--------|---------|---------|
| filesystem | File operations | `@modelcontextprotocol/server-filesystem` |
| memory | Persistent context | `@modelcontextprotocol/server-memory` |
| sequential-thinking | Complex reasoning | `@modelcontextprotocol/server-sequential-thinking` |
| git | Git operations | `mcp-server-git` (uvx) |
| fetch | HTTP requests | `mcp-server-fetch` (uvx) |

### Database (2)
| Server | Purpose | Package |
|--------|---------|---------|
| supabase | Supabase operations | `@supabase/mcp-server-supabase` |
| postgres | Direct PostgreSQL access | `@modelcontextprotocol/server-postgres` |

### Development (3)
| Server | Purpose | Package |
|--------|---------|---------|
| playwright | E2E testing | `@playwright/mcp` |
| chrome-devtools | Frontend debugging | `chrome-devtools-mcp` |
| github | GitHub integration | `@modelcontextprotocol/server-github` |

### Documentation & Utilities (3)
| Server | Purpose | Package |
|--------|---------|---------|
| context7 | AI documentation | `@upstash/context7-mcp` |
| everything | Advanced search | `@modelcontextprotocol/server-everything` |
| time | Timezone utilities | `@modelcontextprotocol/server-time` |

## 🔧 Configuration

MCP servers are configured in: `~/.claude.json`

Environment variables are loaded from: `/opt/go-transit-group/.env.local`

## ⚙️ Required Environment Variables

### Essential
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ACCESS_TOKEN` - Supabase access token
- `POSTGRES_CONNECTION_STRING` - PostgreSQL connection string
- `GITEA_TOKEN` - Gitea personal access token

### Optional (enhances functionality)
- `GITHUB_PERSONAL_ACCESS_TOKEN` - For GitHub MCP
- `BRAVE_API_KEY` - For Brave Search MCP
- `CONTEXT7_API_KEY` - Enhanced rate limits for Context7
- `SLACK_BOT_TOKEN` - For Slack integration

## 🐛 Troubleshooting

See [docs/MCP_TROUBLESHOOTING.md](docs/MCP_TROUBLESHOOTING.md) for detailed troubleshooting.

**Common fixes:**
```bash
# Re-run setup if servers fail
./scripts/setup-all-mcp-servers.sh

# Check specific server
claude mcp get <server-name>

# Remove problematic server
claude mcp remove <server-name>
```

## 📚 Additional Resources

- [MCP Setup Documentation](MCP_SETUP.md)
- [Troubleshooting Guide](docs/MCP_TROUBLESHOOTING.md)
- [Official MCP Docs](https://modelcontextprotocol.io/)
- [Claude Code MCP Guide](https://docs.claude.com/claude-code/mcp)

## 🔄 Maintenance

```bash
# Weekly health check
./scripts/verify-mcp-health.sh

# After updating .env.local
./scripts/setup-all-mcp-servers.sh

# After Claude Code update
claude mcp list  # Verify all servers still connected
```

## ✨ What's Next?

Add more servers as needed:

```bash
# Example: Add Slack integration
claude mcp add-json slack '{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack@latest"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-token"
  }
}'
```

Browse available servers:
- https://mcpservers.org/
- https://github.com/modelcontextprotocol/servers
- https://www.claudemcp.com/

---

**Generated:** $(date)
**Project:** GO Transit Group Pass Coordination App
