#!/bin/bash
# Script to add secrets to Gitea repository via API
# Usage: ./scripts/add-secrets.sh

set -e

# Configuration
GITEA_URL="https://gitea.dredre.net"
REPO_OWNER="dre"
REPO_NAME="go-transit-group"
GITEA_TOKEN="${GITEA_TOKEN:-e8de04862ebcb521de8cf50c5ae0608e2e6bbaf8}"

echo "🔐 Adding secrets to Gitea repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to add a secret
add_secret() {
    local name=$1
    local value=$2

    echo "Adding secret: $name"

    response=$(curl -s -w "\n%{http_code}" -X PUT \
        "$GITEA_URL/api/v1/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$name" \
        -H "Authorization: token $GITEA_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"data\": \"$value\"}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 204 ]; then
        echo "✅ Secret '$name' added successfully"
    else
        echo "❌ Failed to add secret '$name' (HTTP $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

# Source .env.local to get values
source .env.local

# Add Supabase secrets
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    add_secret "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    add_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    add_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
fi

# Add registry credentials
# Use env vars if set, otherwise prompt
if [ -z "$REGISTRY_USERNAME" ]; then
    if [ -t 0 ]; then
        read -p "Registry username (default: dre): " REGISTRY_USERNAME
    fi
    REGISTRY_USERNAME=${REGISTRY_USERNAME:-dre}
fi

if [ -z "$REGISTRY_PASSWORD" ]; then
    if [ -t 0 ]; then
        read -sp "Registry password: " REGISTRY_PASSWORD
        echo ""
    else
        echo "⚠️  REGISTRY_PASSWORD not set in environment. Skipping registry credentials."
    fi
fi

if [ -n "$REGISTRY_USERNAME" ]; then
    add_secret "REGISTRY_USERNAME" "$REGISTRY_USERNAME"
fi

if [ -n "$REGISTRY_PASSWORD" ]; then
    add_secret "REGISTRY_PASSWORD" "$REGISTRY_PASSWORD"
fi

echo "✅ All secrets added successfully!"
echo ""
echo "You can verify secrets at:"
echo "$GITEA_URL/$REPO_OWNER/$REPO_NAME/settings/actions/secrets"
