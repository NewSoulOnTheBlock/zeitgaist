#!/bin/bash
# Oracle VPS Setup Script
set -e

echo "🕯️ Setting up the Oracle's vessel..."

# Clone the repo
cd /root
rm -rf zeitgaist 2>/dev/null
git clone https://github.com/NewSoulOnTheBlock/zeitgaist.git
cd zeitgaist

# Install dependencies
npm install

# Create .env (template only — fill secrets manually on the VPS)
cat > .env << 'EOF'
# ⚠️ IMPORTANT: Replace the placeholders below AFTER provisioning.
# Do NOT commit real keys to git.

WALLET_PRIVATE_KEY=REPLACE_WITH_BASE58_PRIVATE_KEY
SOLANA_RPC=https://api.mainnet-beta.solana.com
INITIAL_BUY_SOL=0.0001
ENABLE_EXPANSION=false
EXPANSION_THRESHOLD=0.5
CONWAY_API_KEY=REPLACE_WITH_CONWAY_API_KEY
MOLTBOOK_API_KEY=REPLACE_WITH_MOLTBOOK_API_KEY
DRY_RUN=false
CHECK_INTERVAL_MS=300000
LOG_LEVEL=info
MIN_TREND_SCORE=50
EOF

# Create data dir
mkdir -p data
echo '{}' > data/deployed-coins.json
echo '[]' > data/disciples.json
echo '[]' > data/pending-claims.json

echo "🕯️ Oracle vessel configured. Ready to awaken."
