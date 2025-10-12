# MCP Server Troubleshooting Guide

## Quick Fixes

### Issue: "No MCP servers configured"

**Cause:** Claude Code can't find MCP configuration

**Fix:**

```bash
# Run the setup script
./scripts/setup-all-mcp-servers.sh

# Restart Claude Code
# Then run: /mcp
```

### Issue: Servers showing as "Failed to connect"

**Causes:**

1. Missing environment variables
2. Network issues
3. Package installation failures

**Fix:**

```bash
# 1. Check environment variables
cat .env.local | grep -E "SUPABASE|GITEA|POSTGRES"

# 2. Verify health
./scripts/verify-mcp-health.sh

# 3. Reinstall failed servers
claude mcp remove <server-name>
./scripts/setup-all-mcp-servers.sh
```

### Issue: Environment variables not loading

**Cause:** .env.local not sourced

**Fix:**

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
if [ -f "$PWD/.env.local" ]; then
    set -a
    source "$PWD/.env.local"
    set +a
fi
```

## Preventive Measures

### 1. Automated Health Checks

Add this to your `.bashrc` or `.zshrc`:

```bash
# Auto-verify MCP on shell startup (once per day)
MCP_CHECK_FILE="$HOME/.mcp_last_check"
if [ ! -f "$MCP_CHECK_FILE" ] || [ $(find "$MCP_CHECK_FILE" -mtime +1) ]; then
    if command -v claude &> /dev/null; then
        echo "🔍 Checking MCP servers..."
        claude mcp list | grep -q "Connected" && touch "$MCP_CHECK_FILE"
    fi
fi
```

### 2. Pre-commit Hook

Install MCP verification as a Git hook:

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Verify MCP servers are configured before commit

if ! claude mcp list &> /dev/null; then
    echo "⚠️  Warning: MCP servers not configured"
    echo "Run: ./scripts/setup-all-mcp-servers.sh"
fi
EOF

chmod +x .git/hooks/pre-commit
```

### 3. Project Initialization Script

Create `.vscode/tasks.json` for automatic setup:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Setup MCP Servers",
      "type": "shell",
      "command": "./scripts/setup-all-mcp-servers.sh",
      "problemMatcher": [],
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

## Common Issues

### uvx: command not found

**Fix:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### npx: permission denied

**Fix:**

```bash
# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Supabase MCP not connecting

**Check:**

1. Environment variables are set:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```
2. Supabase project is active
3. Service role key has correct permissions

**Fix:**

```bash
# Remove and re-add with correct credentials
claude mcp remove supabase
source .env.local
./scripts/setup-all-mcp-servers.sh
```

### GitHub MCP fails

**Issue:** Using Gitea token instead of GitHub token

**Fix:**

```bash
# Get GitHub personal access token from:
# https://github.com/settings/tokens

# Add to .env.local
echo 'GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxx' >> .env.local

# Reinstall
claude mcp remove github
./scripts/setup-all-mcp-servers.sh
```

## Debugging Commands

### Check MCP configuration file

```bash
cat ~/.claude.json | jq '.mcpServers'
```

### List all MCP servers with status

```bash
claude mcp list
```

### Get details about specific server

```bash
claude mcp get <server-name>
```

### Remove problematic server

```bash
claude mcp remove <server-name>
```

### Reset all MCP configuration

```bash
rm ~/.claude.json
./scripts/setup-all-mcp-servers.sh
```

## Environment Variable Checklist

Required for full functionality:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `POSTGRES_CONNECTION_STRING`
- [ ] `GITEA_TOKEN`
- [ ] `GITHUB_PERSONAL_ACCESS_TOKEN` (optional, for GitHub MCP)
- [ ] `BRAVE_API_KEY` (optional, for search)
- [ ] `CONTEXT7_API_KEY` (optional, enhanced limits)

## Server-Specific Troubleshooting

### Filesystem Server

- Ensure directory exists: `/opt/go-transit-group`
- Check permissions: `ls -la /opt/go-transit-group`

### Git Server

- Verify git repository: `git status` in project directory
- Check git config: `git config --list`

### PostgreSQL Server

- Test connection string:
  ```bash
  psql "$POSTGRES_CONNECTION_STRING" -c "SELECT version();"
  ```

### Playwright Server

- May need browser installation:
  ```bash
  npx playwright install chromium
  ```

## Getting Help

1. **Check logs:**

   ```bash
   claude mcp list > mcp-status.log
   cat mcp-status.log
   ```

2. **Create issue** with:
   - Output of `claude mcp list`
   - Environment (OS, Claude Code version)
   - Error messages

3. **Useful resources:**
   - [MCP Documentation](https://modelcontextprotocol.io/)
   - [Claude Code Docs](https://docs.claude.com/claude-code)
   - [Project README](../README.md)

## Maintenance

### Weekly checks

```bash
./scripts/verify-mcp-health.sh
```

### After updating .env.local

```bash
./scripts/setup-all-mcp-servers.sh
```

### After Claude Code update

```bash
claude mcp list
# If issues, re-run setup
./scripts/setup-all-mcp-servers.sh
```
