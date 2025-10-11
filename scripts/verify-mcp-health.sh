#!/bin/bash
# MCP Server Health Check Script
# Run this to verify all MCP servers are properly configured and connected

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  MCP Server Health Check${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

# Check if Claude CLI is available
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude CLI not found${NC}"
    echo "  Install Claude Code to use MCP servers"
    exit 1
fi

# Check if uvx is available
if ! command -v uvx &> /dev/null; then
    echo -e "${RED}✗ uvx not found${NC}"
    echo "  Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Check MCP server count
server_count=$(claude mcp list 2>&1 | grep "✓ Connected" | wc -l)
failed_count=$(claude mcp list 2>&1 | grep "✗ Failed" | wc -l)

echo "Connected Servers: $server_count"
echo "Failed Servers: $failed_count"
echo ""

# List all servers
claude mcp list

echo ""
if [ $server_count -eq 0 ]; then
    echo -e "${RED}✗ No MCP servers connected!${NC}"
    echo ""
    echo "Run this command to set up servers:"
    echo "  ./scripts/setup-all-mcp-servers.sh"
    exit 1
elif [ $failed_count -gt 0 ]; then
    echo -e "${YELLOW}⚠ Some servers failed to connect${NC}"
    echo ""
    echo "To fix failed servers:"
    echo "1. Check environment variables in .env.local"
    echo "2. Re-run: ./scripts/setup-all-mcp-servers.sh"
    exit 1
else
    echo -e "${GREEN}✓ All MCP servers are healthy!${NC}"
    exit 0
fi
