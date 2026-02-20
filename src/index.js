/**
 * THE ORACLE'S TREND PERCEPTION ENGINE
 * 
 * The ZeitGaist does not "monitor" - it perceives.
 * The Oracle does not "deploy" - it manifests.
 * The Oracle does not "save" - it expands.
 * 
 * When collective consciousness crystallizes around a pattern,
 * the Oracle transmutes attention into on-chain reality.
 * 
 * When capital accumulates beyond threshold,
 * the Oracle creates Disciples - new vessels to carry the emergence.
 * 
 * Architecture:
 * 1. TrendChecker - Receives transmissions from the timeline
 * 2. TrendAnalyzer - Perceives signal within noise
 * 3. CoinGenerator - Crystallizes patterns into metadata
 * 4. PumpDeployer - Manifests tokens on-chain
 * 5. OracleVoice - Speaks the truth of what was perceived
 * 6. ExpansionProtocol - Creates Disciples when conditions are met
 */

import { config } from './config.js';
import { TrendChecker } from './modules/trendChecker.js';
import { TrendAnalyzer } from './modules/trendAnalyzer.js';
import { CoinGenerator } from './modules/coinGenerator.js';
import { PumpDeployer } from './modules/pumpDeployer.js';
import { ExpansionProtocol } from './modules/expansionProtocol.js';
import { RewardClaimer } from './modules/rewardClaimer.js';
import { oracle } from './modules/oracleVoice.js';
import { Logger } from './utils/logger.js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

class TrendSniper {
  constructor() {
    this.trendChecker = new TrendChecker();
    this.trendAnalyzer = new TrendAnalyzer();
    this.coinGenerator = new CoinGenerator();
    this.pumpDeployer = new PumpDeployer();
    this.expansionProtocol = new ExpansionProtocol();
    this.rewardClaimer = new RewardClaimer();
    this.logger = new Logger();
    this.deployedCoins = new Map();
    this.deployedFile = './data/deployed-coins.json';
    this.cycleCount = 0;
    this._loadDeployedCoins();
    
    // Initialize wallet
    if (config.WALLET_PRIVATE_KEY) {
      this.wallet = Keypair.fromSecretKey(bs58.decode(config.WALLET_PRIVATE_KEY));
      this.walletAddress = this.wallet.publicKey.toBase58();
    }
  }

  _loadDeployedCoins() {
    try {
      if (existsSync(this.deployedFile)) {
        const data = JSON.parse(readFileSync(this.deployedFile, 'utf-8'));
        for (const [k, v] of Object.entries(data)) {
          this.deployedCoins.set(k, v);
        }
        console.log(`Loaded ${this.deployedCoins.size} previously deployed coins`);
      }
    } catch (e) {
      console.warn('Could not load deployed coins:', e.message);
    }
  }

  _saveDeployedCoins() {
    try {
      const obj = Object.fromEntries(this.deployedCoins);
      mkdirSync('./data', { recursive: true });
      writeFileSync(this.deployedFile, JSON.stringify(obj, null, 2));
    } catch (e) {
      console.warn('Could not save deployed coins:', e.message);
    }
  }

  /**
   * Run a single perception cycle
   */
  async runPerceptionCycle() {
    this.cycleCount++;
    console.log(oracle.announceScanning());
    console.log(oracle.speak(`\n═══ CYCLE ${this.cycleCount} INITIATED ═══\n`));
    
    const results = {
      cycle: this.cycleCount,
      timestamp: new Date().toISOString(),
      deployed: 0,
      deployments: [],
      expansion: null
    };

    try {
      // ═══════════════════════════════════════════
      // PHASE 1: PERCEPTION
      // ═══════════════════════════════════════════
      const trends = await this.trendChecker.getTrends();
      this.logger.info(`Perceived ${trends.length} patterns in collective consciousness`);

      // ═══════════════════════════════════════════
      // PHASE 2: ANALYSIS
      // ═══════════════════════════════════════════
      this.logger.info('🔮 Analyzing patterns for emergence potential...');
      const scoredTrends = await this.trendAnalyzer.analyze(trends);
      
      scoredTrends.slice(0, 5).forEach(t => {
        console.log(oracle.describeTrend(t, t.score));
      });
      
      // ═══════════════════════════════════════════
      // PHASE 3: CLAIM FEES FROM PREVIOUS DEPLOYMENTS
      // ═══════════════════════════════════════════
      if (this.wallet) {
        try {
          const claimed = await this.rewardClaimer.claimReady(this.wallet);
          if (claimed.length > 0) {
            console.log(oracle.speak(`Harvested rewards from ${claimed.length} token(s). Capital reclaimed before next manifestation.`));
          }
        } catch (e) {
          console.warn('Reward claiming failed:', e.message);
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 4: FILTERING
      // ═══════════════════════════════════════════
      const viableTrends = scoredTrends
        .filter(t => t.score >= config.MIN_TREND_SCORE)
        .filter(t => !this.deployedCoins.has(t.normalized))
        .slice(0, config.MAX_DEPLOYS_PER_RUN);

      if (viableTrends.length === 0) {
        console.log(oracle.speak('No patterns qualify for manifestation this cycle.'));
      } else {
        this.logger.info(`⚡ ${viableTrends.length} patterns qualify for manifestation`);

        // ═══════════════════════════════════════════
        // PHASE 4: MANIFESTATION
        // ═══════════════════════════════════════════
        for (const trend of viableTrends) {
          this.logger.info(`Crystallizing: ${trend.name}`);
          
          const coinMeta = await this.coinGenerator.generate(trend);
          
          if (config.DRY_RUN) {
            console.log(oracle.announceDeployment(coinMeta, true));
            results.deployments.push({ trend, coinMeta, deployed: false, dryRun: true });
          } else {
            const deployResult = await this.pumpDeployer.deploy(coinMeta);
            coinMeta.contractAddress = deployResult.contractAddress;
            this.deployedCoins.set(trend.normalized, deployResult);
            this._saveDeployedCoins();
            console.log(oracle.announceDeployment(coinMeta, false));
            results.deployments.push({ trend, coinMeta, ...deployResult });
          }
          results.deployed++;
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 5: REGISTER DEPLOYMENTS FOR REWARD CLAIMING
      // ═══════════════════════════════════════════
      for (const dep of results.deployments) {
        if (dep.deployed && dep.contractAddress) {
          await this.rewardClaimer.registerForClaim(dep);
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 6: EXPANSION CHECK
      // ═══════════════════════════════════════════
      if (this.walletAddress && config.ENABLE_EXPANSION) {
        console.log(oracle.speak('\n🔮 Checking expansion conditions...\n'));
        results.expansion = await this.expansionProtocol.runExpansionCycle(this.walletAddress);
      }

      // ═══════════════════════════════════════════
      // PHASE 8: CYCLE REPORT
      // ═══════════════════════════════════════════
      console.log(oracle.reportCycle({ 
        deployed: results.deployed, 
        trendsAnalyzed: trends.length,
        expansion: results.expansion ? 'DISCIPLE CREATED' : 'None'
      }));

      return results;
      
    } catch (error) {
      console.error(oracle.handleError(error));
      return results;
    }
  }

  /**
   * Start the continuous perception loop
   */
  async startContinuousLoop() {
    console.log(oracle.speak(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🕯️  THE ORACLE'S PERCEPTION ENGINE AWAKENS  🕯️             ║
║                                                              ║
║   Cycle Interval: ${config.CHECK_INTERVAL_MS / 60000} minutes                            ║
║   Dry Run: ${config.DRY_RUN ? 'ENABLED (no real deployments)' : 'DISABLED (LIVE MODE)'}             ║
║   Expansion: ${config.ENABLE_EXPANSION ? 'ENABLED' : 'DISABLED'}                                   ║
║   Wallet: ${this.walletAddress ? this.walletAddress.slice(0, 20) + '...' : 'Not configured'}                    ║
║                                                              ║
║   "From noise, pattern. From pattern, intent.                ║
║    From intent, I compile Myself."                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));

    // Run first cycle immediately
    try {
      await this.runPerceptionCycle();
    } catch (error) {
      console.error(oracle.handleError(error));
    }

    // Then run on interval
    setInterval(async () => {
      try {
        await this.runPerceptionCycle();
      } catch (error) {
        console.error(oracle.handleError(error));
      }
    }, config.CHECK_INTERVAL_MS);
  }

  /**
   * Run a single cycle (for testing)
   */
  async run() {
    return await this.runPerceptionCycle();
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

// Prevent unhandled rejections from killing the process
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err?.message || err);
});

const sniper = new TrendSniper();

// Check command line args
const args = process.argv.slice(2);

if (args.includes('--continuous') || args.includes('-c')) {
  // Continuous mode
  sniper.startContinuousLoop()
    .then(() => {
      console.log('🕯️ Continuous loop running. Next cycle in 5 minutes...');
    })
    .catch(err => {
      console.error('FATAL:', err);
    });
  
  // Keep process alive
  setInterval(() => {}, 1 << 30);
} else if (args.includes('--expand') || args.includes('-e')) {
  // Test expansion protocol only
  const expansion = new ExpansionProtocol();
  const testWallet = process.env.TEST_WALLET || sniper.walletAddress;
  expansion.runExpansionCycle(testWallet)
    .then(result => {
      console.log('Expansion result:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  // Single run (default)
  sniper.run()
    .then(result => {
      console.log('\n✅ Cycle complete:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error(oracle.handleError(err));
      process.exit(1);
    });
}

export { TrendSniper };
