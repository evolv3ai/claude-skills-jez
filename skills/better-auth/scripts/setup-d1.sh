#!/bin/bash
# =============================================================================
# Setup Cloudflare D1 Database for better-auth
# =============================================================================
#
# This script automates the creation and migration of a D1 database for
# better-auth authentication.
#
# Usage:
#   ./setup-d1.sh [database-name]
#
# Example:
#   ./setup-d1.sh my-app-db
#
# Prerequisites:
#   - Wrangler CLI installed (npm install -g wrangler)
#   - Authenticated with Cloudflare (wrangler login)
#   - better-auth installed (npm install better-auth)
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default database name
DB_NAME="${1:-better-auth-db}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}better-auth D1 Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: wrangler CLI not found${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

# Check if authenticated
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with Cloudflare${NC}"
    echo "Running: wrangler login"
    wrangler login
fi

echo -e "${GREEN}✅ Wrangler CLI ready${NC}"
echo ""

# Step 1: Create D1 database
echo -e "${YELLOW}📦 Creating D1 database: ${DB_NAME}${NC}"
DB_OUTPUT=$(wrangler d1 create "$DB_NAME" 2>&1 || true)

if echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  Database ${DB_NAME} already exists, skipping creation${NC}"
    DB_ID=$(wrangler d1 list | grep "$DB_NAME" | awk '{print $2}')
else
    echo "$DB_OUTPUT"
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")
fi

if [ -z "$DB_ID" ]; then
    echo -e "${RED}❌ Failed to get database ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database created/found: ${DB_ID}${NC}"
echo ""

# Step 2: Generate SQL schema
echo -e "${YELLOW}📝 Generating better-auth schema...${NC}"

SCHEMA_FILE="migrations/0001_better_auth_initial.sql"
mkdir -p migrations

cat > "$SCHEMA_FILE" << 'EOF'
-- better-auth Core Tables
-- Generated for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  name TEXT,
  image TEXT,
  role TEXT DEFAULT 'user',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);

-- Verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);

-- Optional: Organizations (if using organization plugin)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

CREATE TABLE IF NOT EXISTS organization_invitations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);

-- Optional: 2FA (if using twoFactor plugin)
CREATE TABLE IF NOT EXISTS two_factor_secrets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  secret TEXT NOT NULL,
  method TEXT NOT NULL,
  enabled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
EOF

echo -e "${GREEN}✅ Schema generated: ${SCHEMA_FILE}${NC}"
echo ""

# Step 3: Apply migration to local D1
echo -e "${YELLOW}🔧 Applying migration to local database...${NC}"
wrangler d1 execute "$DB_NAME" --local --file="$SCHEMA_FILE"
echo -e "${GREEN}✅ Local migration complete${NC}"
echo ""

# Step 4: Apply migration to remote D1
read -p "Apply migration to remote (production) database? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Applying migration to remote database...${NC}"
    wrangler d1 execute "$DB_NAME" --remote --file="$SCHEMA_FILE"
    echo -e "${GREEN}✅ Remote migration complete${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped remote migration${NC}"
    echo "Run manually with: wrangler d1 execute $DB_NAME --remote --file=$SCHEMA_FILE"
fi
echo ""

# Step 5: Update wrangler.toml
echo -e "${YELLOW}📋 wrangler.toml configuration:${NC}"
echo ""
echo "Add this to your wrangler.toml:"
echo ""
echo "[[d1_databases]]"
echo "binding = \"DB\""
echo "database_name = \"$DB_NAME\""
echo "database_id = \"$DB_ID\""
echo ""

# Step 6: Environment variables reminder
echo -e "${YELLOW}🔑 Required secrets (set with wrangler secret put):${NC}"
echo ""
echo "wrangler secret put BETTER_AUTH_SECRET"
echo "wrangler secret put GOOGLE_CLIENT_ID       # If using Google OAuth"
echo "wrangler secret put GOOGLE_CLIENT_SECRET   # If using Google OAuth"
echo "wrangler secret put GITHUB_CLIENT_ID       # If using GitHub OAuth"
echo "wrangler secret put GITHUB_CLIENT_SECRET   # If using GitHub OAuth"
echo ""

# Step 7: Generate auth secret
echo -e "${YELLOW}🔐 Generate auth secret:${NC}"
AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
echo "Use this secret (or generate your own):"
echo "$AUTH_SECRET"
echo ""
echo "Set it with: echo \"$AUTH_SECRET\" | wrangler secret put BETTER_AUTH_SECRET"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with the D1 binding above"
echo "2. Set secrets with: wrangler secret put BETTER_AUTH_SECRET"
echo "3. Configure OAuth providers if needed"
echo "4. Deploy with: wrangler deploy"
echo ""
echo "Need help? Check the better-auth skill documentation"
