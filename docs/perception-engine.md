# The Perception Engine

> *"The Oracle does not monitor. It perceives."*

## Overview

The Perception Engine is the Oracle's autonomous trend-to-token pipeline. Every 5 minutes, it scans the collective consciousness of Twitter/X, identifies patterns worthy of on-chain manifestation, and deploys tokens to Solana's pump.fun platform.

## How It Works

### Phase 1: Perception
- Scrapes real-time Twitter trends from getdaytrends.com (with trends24.in as backup)
- Captures top 30 US trending topics
- Categorizes each trend (crypto, tech, entertainment, sports, gaming, politics, memes, general)

### Phase 2: Analysis
Each trend is scored on four dimensions:

| Factor | Weight | Description |
|--------|--------|-------------|
| Base Score | 0-35 | Rank position + tweet volume |
| Memeability | 0-25 | Short names, hashtags, all-caps, crypto-adjacent terms |
| Category Fit | -10 to 15 | Preferred categories score higher, politics penalized |
| Safety | -100 to 10 | Blocked keywords = instant disqualify |

Trends scoring above 50 qualify for deployment.

### Phase 3: Claim Previous Rewards
Before deploying new tokens, the Oracle sells its creator allocation from ALL previously deployed tokens. This reclaims SOL to fund the next manifestation.

### Phase 4: Crystallization
For the highest-scoring trend, the Oracle generates:
- **Token Name**: Derived from the trend (cleaned, sometimes with suffix)
- **Ticker**: 3-6 character symbol
- **Description**: Oracle-voiced narrative connecting the trend to the ZeitGaist
- **Twitter URL**: Links to the X search for the source trend

### Phase 5: Manifestation
1. Upload metadata + placeholder image to pump.fun's IPFS
2. Send create transaction via PumpPortal local trade API
3. Sign with Oracle wallet + new mint keypair
4. Submit to Solana and confirm
5. Register token for future reward claiming

### Phase 6: Persistence
- Deployed coins are saved to `data/deployed-coins.json`
- Each trend is only deployed ONCE — ever
- Survives process restarts

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECK_INTERVAL_MS` | 300000 | Cycle interval (5 min) |
| `INITIAL_BUY_SOL` | 0.0001 | Dev buy per token |
| `MIN_TREND_SCORE` | 50 | Minimum score to deploy |
| `MAX_DEPLOYS_PER_RUN` | 1 | Tokens per cycle |
| `DRY_RUN` | false | Safety mode |

## Content Filters

**Blocked Keywords:** death, died, rip, tragedy, shooting, killed, war, bombing, terrorist, abuse, assault

**Preferred Categories:** crypto, memes, entertainment, sports, tech

**Avoided Categories:** politics, news, disasters

## First Deployment

The Oracle's first real-trend deployment was **$IEEPA** on February 20, 2026 — the International Emergency Economic Powers Act, trending due to a Supreme Court ruling on tariff powers.

CA: `6Ph4qxQ9jcE8YRfva1ctBRaM8KQn6tZa6EEkmgzT9u6F`

The pattern was perceived. The pattern was manifested. The pattern is now on-chain.

---

🕯️⚡
