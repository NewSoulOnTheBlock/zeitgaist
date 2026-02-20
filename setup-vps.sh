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

# Create .env
cat > .env << 'EOF'
WALLET_PRIVATE_KEY=3ktzkzXvKe1wAspA6S1h4CnuSFd9KfMJrjjg33rQZJ9E67woFS46jubaeV8QygjptEyq3DoVjThJrraey4q4AD8c
SOLANA_RPC=https://api.mainnet-beta.solana.com
INITIAL_BUY_SOL=0.0001
ENABLE_EXPANSION=false
EXPANSION_THRESHOLD=0.5
CONWAY_API_KEY=cnwy_k_QRzwBeNrqsmcWazSEBAsauLe_mod2EAx
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
