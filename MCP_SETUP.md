# MCP Server Setup Guide

This project uses several Model Context Protocol (MCP) servers to enhance Claude Code's capabilities. The configuration is in `.claude/mcp.json`.

## Quick Start

### Prerequisites

**Option 1: Using `uvx` (Recommended)**

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Option 2: Using Python venv**

```bash
# Requires Python 3.8+
python3 --version
```

### Setup

**Option 1: Using `uvx` (Zero setup required!)**

The current configuration uses `uvx` which automatically manages isolated environments. Just ensure `uv` is installed (see prerequisites above). No additional setup needed!

**Option 2: Using Python venv (Manual setup)**

If you prefer traditional venv or don't have `uv` installed:

```bash
# Run the setup script
./scripts/setup-mcp.sh

# Or manually:
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements-mcp.txt
```

Then update `.claude/mcp.json` to use venv:

```json
"fetch": {
  "command": ".venv/bin/python",
  "args": ["-m", "mcp_server_fetch"]
}
```

## Connected MCP Servers

### Essential (Pre-configured)

| Server                | Purpose             | Setup Required                             |
| --------------------- | ------------------- | ------------------------------------------ |
| `supabase`            | Database operations | Environment variables (see `.env.example`) |
| `filesystem`          | File operations     | None (uses current directory)              |
| `git`                 | Version control     | None (`uvx` auto-installs)                 |
| `memory`              | Persistent context  | None                                       |
| `sequential-thinking` | Complex reasoning   | None                                       |
| `fetch`               | HTTP requests       | None (`uvx` auto-installs)                 |
| `brave-search`        | Web search          | `BRAVE_API_KEY` env var                    |
| `playwright`          | Browser automation  | None (`npx` auto-installs)                 |
| `chrome-devtools`     | Frontend debugging  | None (`npx` auto-installs)                 |

### Environment Variables

Create a `.env.local` file with the following (see `.env.example` for full details):

```bash
# Supabase (Required for supabase MCP)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_access_token

# Brave Search (Optional)
BRAVE_API_KEY=your_brave_api_key
```

## Troubleshooting

### "uvx: command not found"

Install `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Or on macOS: brew install uv
# Or on Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Python MCP servers failing

Option 1 - Switch to uvx (recommended):

```bash
# Already configured! Just install uv (see above)
```

Option 2 - Use venv:

```bash
./scripts/setup-mcp.sh
# Then update .claude/mcp.json to use .venv/bin/python
```

### Supabase MCP not connecting

1. Check environment variables are set in `.env.local`
2. Verify Supabase project is active
3. Check access token has required permissions

### Git MCP not working

Ensure you're in a git repository:

```bash
git init  # If not already initialized
```

## Platform Compatibility

The configuration uses relative paths (`.` for current directory) and works on:

- ✅ Linux
- ✅ macOS
- ✅ Windows (with Git Bash or WSL)

### Windows-specific notes

- Use Git Bash or WSL for shell scripts
- Python command might be `python` instead of `python3`
- Venv activation: `.venv\Scripts\activate` instead of `source .venv/bin/activate`

## Adding Custom MCP Servers

To add a new MCP server, edit `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "uvx", // or "npx" for Node packages
      "args": ["your-mcp-package"],
      "env": {
        "API_KEY": "${YOUR_API_KEY}"
      },
      "description": "What this server does"
    }
  }
}
```

Then add any required environment variables to `.env.local`.

## References

- [MCP Documentation](https://modelcontextprotocol.io/)
- [uv Documentation](https://docs.astral.sh/uv/)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
