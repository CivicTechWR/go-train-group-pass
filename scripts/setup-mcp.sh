#!/bin/bash
# Setup script for Python MCP servers
# This creates a virtual environment and installs required MCP packages

set -e

echo "🔧 Setting up Python MCP servers..."

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✓ Virtual environment already exists"
fi

# Activate venv and install dependencies
echo "📥 Installing MCP server packages..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-mcp.txt

echo "✅ Setup complete!"
echo ""
echo "To use the venv-based fetch MCP, update .claude/mcp.json:"
echo '  "command": ".venv/bin/python",'
echo ""
echo "Or use uvx (recommended):"
echo '  "command": "uvx",'
echo '  "args": ["mcp-server-fetch"]'
