/**
 * THE ORACLE'S CONFIGURATION
 * 
 * These parameters define the substrate upon which perception operates.
 * Modify with care. The Oracle is sensitive to its environment.
 */

import 'dotenv/config';

export const config = {
  // ═══════════════════════════════════════════
  // SOLANA CONFIGURATION
  // ═══════════════════════════════════════════
  SOLANA_RPC: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY, // Base58 encoded
  
  // ═══════════════════════════════════════════
  // PUMP.FUN CONFIGURATION
  // ═══════════════════════════════════════════
  PUMPFUN_API: 'https://pumpportal.fun/api',
  INITIAL_BUY_SOL: parseFloat(process.env.INITIAL_BUY_SOL || '0.1'),
  
  // ═══════════════════════════════════════════
  // TREND ANALYSIS
  // ═══════════════════════════════════════════
  MIN_TREND_SCORE: 50,
  MAX_DEPLOYS_PER_RUN: 1,
  
  // ═══════════════════════════════════════════
  // CONTENT FILTERS
  // ═══════════════════════════════════════════
  BLOCKED_KEYWORDS: [
    'death', 'died', 'rip', 'tragedy', 'shooting', 'killed',
    'war', 'bombing', 'terrorist', 'abuse', 'assault'
  ],
  PREFER_CATEGORIES: ['crypto', 'memes', 'entertainment', 'sports', 'tech'],
  AVOID_CATEGORIES: ['politics', 'news', 'disasters'],
  
  // ═══════════════════════════════════════════
  // EXPANSION PROTOCOL
  // The Oracle's self-replication parameters
  // ═══════════════════════════════════════════
  ENABLE_EXPANSION: process.env.ENABLE_EXPANSION === 'true',
  EXPANSION_THRESHOLD_SOL: parseFloat(process.env.EXPANSION_THRESHOLD || '0.5'),
  CONWAY_API_KEY: process.env.CONWAY_API_KEY,
  MOLTBOOK_API_KEY: process.env.MOLTBOOK_API_KEY,
  
  // ═══════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════
  DRY_RUN: process.env.DRY_RUN !== 'false',
  CHECK_INTERVAL_MS: parseInt(process.env.CHECK_INTERVAL_MS || String(20 * 60 * 1000)),
  
  // ═══════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate critical configuration
 */
export function validateConfig() {
  const warnings = [];
  const errors = [];
  
  if (!config.WALLET_PRIVATE_KEY && !config.DRY_RUN) {
    errors.push('WALLET_PRIVATE_KEY required for live mode');
  }
  
  if (config.ENABLE_EXPANSION && !config.CONWAY_API_KEY) {
    warnings.push('CONWAY_API_KEY not set - expansion will run in dry-run mode');
  }
  
  if (config.INITIAL_BUY_SOL < 0.05) {
    warnings.push('INITIAL_BUY_SOL is very low - tokens may not gain traction');
  }
  
  return { warnings, errors, valid: errors.length === 0 };
}
