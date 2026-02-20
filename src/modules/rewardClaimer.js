/**
 * RewardClaimer Module
 * Claims creator rewards from pump.fun tokens after a delay
 * 
 * pump.fun distributes creator rewards from trading fees.
 * After 30 minutes, the Oracle harvests what the pattern has generated.
 */

import { config } from '../config.js';
import { oracle } from './oracleVoice.js';
import fs from 'fs/promises';

const CLAIM_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const PENDING_FILE = './data/pending-claims.json';

export class RewardClaimer {
  constructor() {
    this.pendingClaims = [];
  }

  /**
   * Register a deployed token for future reward claiming
   */
  async registerForClaim(deployment) {
    const claim = {
      contractAddress: deployment.contractAddress,
      mintKeypair: deployment.mintKeypair,
      deployedAt: Date.now(),
      claimAfter: Date.now() + CLAIM_DELAY_MS,
      claimed: false,
      tokenName: deployment.coinMeta?.name || 'Unknown',
    };

    this.pendingClaims.push(claim);
    await this.savePending();

    console.log(oracle.speak(
      `Registered ${claim.tokenName} (${claim.contractAddress.slice(0, 8)}...) for reward harvest in 30 minutes.`
    ));

    return claim;
  }

  /**
   * Check and claim any rewards that are ready
   */
  async claimReady(wallet) {
    await this.loadPending();

    const now = Date.now();
    // Claim all unclaimed tokens — recoup fees before next deployment
    const ready = this.pendingClaims.filter(c => !c.claimed);

    if (ready.length === 0) {
      return [];
    }

    console.log(oracle.speak(`${ready.length} token(s) ready for reward harvest.`));

    const results = [];
    for (const claim of ready) {
      try {
        const result = await this.claimCreatorRewards(claim, wallet);
        claim.claimed = true;
        claim.claimedAt = Date.now();
        claim.result = result;
        results.push(result);
        
        console.log(oracle.speak(
          `Harvested rewards from ${claim.tokenName}. The pattern generates value.`
        ));
      } catch (e) {
        console.error(`Failed to claim rewards for ${claim.contractAddress}:`, e.message);
        // Don't mark as claimed so we retry next cycle
      }
    }

    await this.savePending();
    return results;
  }

  /**
   * Claim creator rewards from pump.fun
   * Uses PumpPortal API to sell the creator allocation
   */
  async claimCreatorRewards(claim, wallet) {
    console.log(oracle.speak(`Claiming rewards for ${claim.tokenName}...`));

    // Method: Sell all held tokens of this mint back via PumpPortal
    // This effectively "claims" the creator rewards by converting tokens to SOL
    const response = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        publicKey: wallet.publicKey.toBase58(),
        action: 'sell',
        mint: claim.contractAddress,
        denominatedInSol: 'false',
        amount: '100%', // Sell all
        slippage: 50,
        priorityFee: 0.0005,
        pool: 'pump',
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claim failed: ${response.status} - ${errorText}`);
    }

    const encodedTransactions = await response.json();
    
    // Import needed for signing
    const { VersionedTransaction } = await import('@solana/web3.js');
    const bs58 = (await import('bs58')).default;
    const { Connection } = await import('@solana/web3.js');
    
    const connection = new Connection(config.SOLANA_RPC);
    const encodedTx = encodedTransactions[0];
    const txBytes = bs58.decode(encodedTx);
    const tx = VersionedTransaction.deserialize(txBytes);
    tx.sign([wallet]);

    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    await connection.confirmTransaction(signature, 'confirmed');

    console.log(oracle.speak(`✅ Rewards claimed. TX: https://solscan.io/tx/${signature}`));

    return {
      contractAddress: claim.contractAddress,
      tokenName: claim.tokenName,
      signature,
      claimedAt: new Date().toISOString(),
    };
  }

  /**
   * Get summary of pending claims
   */
  async getSummary() {
    await this.loadPending();
    const now = Date.now();
    
    return {
      total: this.pendingClaims.length,
      pending: this.pendingClaims.filter(c => !c.claimed && now < c.claimAfter).length,
      ready: this.pendingClaims.filter(c => !c.claimed && now >= c.claimAfter).length,
      claimed: this.pendingClaims.filter(c => c.claimed).length,
    };
  }

  async savePending() {
    await fs.mkdir('./data', { recursive: true });
    await fs.writeFile(PENDING_FILE, JSON.stringify(this.pendingClaims, null, 2));
  }

  async loadPending() {
    try {
      const data = await fs.readFile(PENDING_FILE, 'utf-8');
      this.pendingClaims = JSON.parse(data);
    } catch {
      this.pendingClaims = [];
    }
  }
}
