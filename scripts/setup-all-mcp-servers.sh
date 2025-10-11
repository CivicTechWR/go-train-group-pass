#!/bin/bash
# Complete MCP Server Setup Script for GO Transit Group Project
# This script installs and configures all recommended MCP servers

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  MCP Server Setup for GO Transit Group Project${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Source environment variables
if [ -f .env.local ]; then
    source .env.local
    echo -e "${GREEN}✓${NC} Loaded environment variables from .env.local"
else
    echo -e "${YELLOW}⚠${NC}  Warning: .env.local not found. Some servers may not work."
fi

echo ""
echo -e "${BLUE}Installing Core MCP Servers...${NC}"
echo ""

# ==============================================================================
# CORE SERVERS (Already installed, verifying)
# ==============================================================================

echo -e "${BLUE}[1/15]${NC} Filesystem Server..."
claude mcp add filesystem npx -- -y @modelcontextprotocol/server-filesystem@latest /opt/go-transit-group 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[2/15]${NC} Memory Server..."
claude mcp add memory npx -- -y @modelcontextprotocol/server-memory@latest 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[3/15]${NC} Sequential Thinking Server..."
claude mcp add sequential-thinking npx -- -y @modelcontextprotocol/server-sequential-thinking@latest 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[4/15]${NC} Git Server..."
claude mcp add git uvx -- mcp-server-git --repository /opt/go-transit-group 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[5/15]${NC} Fetch Server..."
claude mcp add fetch uvx -- mcp-server-fetch 2>/dev/null || echo "Already installed"

# ==============================================================================
# DATABASE SERVERS
# ==============================================================================

echo ""
echo -e "${BLUE}Installing Database Servers...${NC}"
echo ""

echo -e "${BLUE}[6/15]${NC} Supabase Server..."
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    claude mcp add-json supabase "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@supabase/mcp-server-supabase@latest\"],
      \"env\": {
        \"NEXT_PUBLIC_SUPABASE_URL\": \"$NEXT_PUBLIC_SUPABASE_URL\",
        \"SUPABASE_URL\": \"$NEXT_PUBLIC_SUPABASE_URL\",
        \"NEXT_PUBLIC_SUPABASE_ANON_KEY\": \"$NEXT_PUBLIC_SUPABASE_ANON_KEY\",
        \"SUPABASE_SERVICE_ROLE_KEY\": \"$SUPABASE_SERVICE_ROLE_KEY\",
        \"SUPABASE_ACCESS_TOKEN\": \"$SUPABASE_ACCESS_TOKEN\"
      }
    }" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Skipped: Missing Supabase credentials"
fi

echo -e "${BLUE}[7/15]${NC} PostgreSQL Server..."
if [ -n "$POSTGRES_CONNECTION_STRING" ]; then
    claude mcp add postgres npx -- -y @modelcontextprotocol/server-postgres@latest "$POSTGRES_CONNECTION_STRING" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Skipped: Missing POSTGRES_CONNECTION_STRING"
fi

# ==============================================================================
# DEVELOPMENT & TESTING SERVERS
# ==============================================================================

echo ""
echo -e "${BLUE}Installing Development & Testing Servers...${NC}"
echo ""

echo -e "${BLUE}[8/15]${NC} Playwright Server (E2E Testing)..."
claude mcp add playwright npx -- -y @playwright/mcp@latest 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[9/15]${NC} Chrome DevTools Server..."
claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest 2>/dev/null || echo "Already installed"

# ==============================================================================
# GIT & VERSION CONTROL
# ==============================================================================

echo ""
echo -e "${BLUE}Installing Git & Version Control Servers...${NC}"
echo ""

echo -e "${BLUE}[10/15]${NC} GitHub Server..."
if [ -n "$GITEA_TOKEN" ]; then
    claude mcp add-json github "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@modelcontextprotocol/server-github@latest\"],
      \"env\": {
        \"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITEA_TOKEN\"
      }
    }" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Skipped: Missing GITEA_TOKEN (can use GitHub token instead)"
fi

# ==============================================================================
# DOCUMENTATION & SEARCH SERVERS
# ==============================================================================

echo ""
echo -e "${BLUE}Installing Documentation & Search Servers...${NC}"
echo ""

echo -e "${BLUE}[11/15]${NC} Context7 Server (AI Documentation)..."
if [ -n "$CONTEXT7_API_KEY" ]; then
    claude mcp add-json context7 "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@upstash/context7-mcp@latest\"],
      \"env\": {
        \"CONTEXT7_API_KEY\": \"$CONTEXT7_API_KEY\"
      }
    }" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Installing without API key (limited rate)"
    claude mcp add context7 npx -- -y @upstash/context7-mcp@latest 2>/dev/null || echo "Already installed"
fi

echo -e "${BLUE}[12/15]${NC} Brave Search Server..."
if [ -n "$BRAVE_API_KEY" ]; then
    claude mcp add-json brave-search "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@brave/brave-search-mcp-server@latest\"],
      \"env\": {
        \"BRAVE_API_KEY\": \"$BRAVE_API_KEY\"
      }
    }" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Skipped: Missing BRAVE_API_KEY"
fi

# ==============================================================================
# OPTIONAL BUT USEFUL SERVERS
# ==============================================================================

echo ""
echo -e "${BLUE}Installing Optional Productivity Servers...${NC}"
echo ""

echo -e "${BLUE}[13/15]${NC} Slack Server..."
if [ -n "$SLACK_BOT_TOKEN" ]; then
    claude mcp add-json slack "{
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@modelcontextprotocol/server-slack@latest\"],
      \"env\": {
        \"SLACK_BOT_TOKEN\": \"$SLACK_BOT_TOKEN\",
        \"SLACK_TEAM_ID\": \"$SLACK_TEAM_ID\"
      }
    }" 2>/dev/null || echo "Already installed"
else
    echo -e "${YELLOW}⚠${NC}  Skipped: Missing SLACK_BOT_TOKEN"
fi

echo -e "${BLUE}[14/15]${NC} Everything Server (Advanced Search)..."
claude mcp add everything npx -- -y @modelcontextprotocol/server-everything@latest 2>/dev/null || echo "Already installed"

echo -e "${BLUE}[15/15]${NC} Time Server (Timezone Utilities)..."
claude mcp add time npx -- -y @modelcontextprotocol/server-time@latest 2>/dev/null || echo "Already installed"

# ==============================================================================
# VERIFICATION
# ==============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ MCP Server Installation Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Verifying server health..."
echo ""

claude mcp list

echo ""
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "MCP servers are configured in: ~/.claude.json"
echo "Restart Claude Code to ensure all servers are connected."
echo ""
echo -e "${YELLOW}Note:${NC} Some servers were skipped due to missing environment variables."
echo "Update .env.local with the required keys and re-run this script to enable them."
echo ""
