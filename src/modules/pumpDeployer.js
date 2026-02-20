/**
 * PumpDeployer Module
 * Deploys tokens to pump.fun via PumpPortal API
 * 
 * Flow:
 * 1. Upload metadata + image to pump.fun IPFS
 * 2. Send create transaction via PumpPortal local trade API
 * 3. Sign and submit to Solana
 */

import { config } from '../config.js';
import { Keypair, Connection, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

export class PumpDeployer {
  constructor() {
    this.connection = new Connection(config.SOLANA_RPC);
    this.wallet = this.loadWallet();
  }

  loadWallet() {
    if (!config.WALLET_PRIVATE_KEY) {
      console.warn('No wallet configured - deployment will fail');
      return null;
    }
    try {
      const secretKey = bs58.decode(config.WALLET_PRIVATE_KEY);
      return Keypair.fromSecretKey(secretKey);
    } catch (e) {
      console.error('Failed to load wallet:', e.message);
      return null;
    }
  }

  async deploy(coinMeta) {
    if (!this.wallet) throw new Error('Wallet not configured');
    console.log(`🚀 Deploying ${coinMeta.name} ($${coinMeta.ticker})...`);
    return await this.deployViaPumpPortal(coinMeta);
  }

  async deployViaPumpPortal(coinMeta) {
    // Generate a new keypair for the token mint
    const mintKeypair = Keypair.generate();

    // Step 1: Upload metadata to pump.fun IPFS
    const metadataResponse = await this.uploadMetadata(coinMeta);
    console.log(`📦 IPFS metadata uploaded: ${metadataResponse.metadataUri}`);

    // Step 2: Build create transaction via PumpPortal
    const createPayload = [
      {
        publicKey: this.wallet.publicKey.toBase58(),
        action: 'create',
        tokenMetadata: {
          name: coinMeta.name,
          symbol: coinMeta.ticker,
          uri: metadataResponse.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: 'true',
        amount: config.INITIAL_BUY_SOL,
        slippage: 10,
        priorityFee: 0.0005,
        pool: 'pump',
      }
    ];

    const response = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PumpPortal API error: ${response.status} - ${errorText}`);
    }

    const encodedTransactions = await response.json();

    // Step 3: Sign and send
    const encodedTx = encodedTransactions[0];
    const txBytes = bs58.decode(encodedTx);
    const tx = VersionedTransaction.deserialize(txBytes);
    tx.sign([mintKeypair, this.wallet]);

    const signature = await this.connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    try {
      await this.connection.confirmTransaction(signature, 'confirmed');
    } catch (e) {
      console.warn('Confirmation check failed (tx may still succeed):', e.message);
    }

    const contractAddress = mintKeypair.publicKey.toBase58();

    console.log(`✅ Deployed! CA: ${contractAddress}`);
    console.log(`   TX: https://solscan.io/tx/${signature}`);
    console.log(`   Pump: https://pump.fun/${contractAddress}`);

    return {
      deployed: true,
      contractAddress,
      signature,
      pumpUrl: `https://pump.fun/${contractAddress}`,
      solscanUrl: `https://solscan.io/tx/${signature}`,
      mintKeypair: bs58.encode(mintKeypair.secretKey),
    };
  }

  async uploadMetadata(coinMeta) {
    // Use scraped image or placeholder
    let imageBlob;
    if (coinMeta.imageBlob) {
      imageBlob = coinMeta.imageBlob;
      console.log('🖼️ Using scraped image from Google Images');
    } else if (coinMeta.imageUrl) {
      try {
        const imgResponse = await fetch(coinMeta.imageUrl);
        imageBlob = await imgResponse.blob();
      } catch (e) {
        console.warn('Failed to fetch image, using placeholder');
        imageBlob = this.createPlaceholderImage();
      }
    } else {
      console.warn('No image available, using placeholder');
      imageBlob = this.createPlaceholderImage();
    }

    const formData = new FormData();
    formData.append('file', imageBlob, 'logo.png');
    formData.append('name', coinMeta.name);
    formData.append('symbol', coinMeta.ticker);
    formData.append('description', coinMeta.description);
    formData.append('twitter', coinMeta.twitter || '');
    formData.append('telegram', coinMeta.telegram || '');
    formData.append('website', coinMeta.website || '');
    formData.append('showName', 'true');

    const response = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Minimal valid PNG (1x1 orange pixel)
   */
  createPlaceholderImage() {
    const pngBytes = new Uint8Array([
      137,80,78,71,13,10,26,10,
      0,0,0,13,73,72,68,82,
      0,0,0,1,0,0,0,1,8,2,0,0,0,144,119,83,222,0,
      0,0,12,73,68,65,84,8,215,99,248,207,128,0,0,0,3,0,1,54,174,216,54,0,
      0,0,0,0,73,69,78,68,174,66,96,130
    ]);
    return new Blob([pngBytes], { type: 'image/png' });
  }

  async checkBalance() {
    if (!this.wallet) return 0;
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }
}

if (process.argv[1]?.includes('pumpDeployer')) {
  const deployer = new PumpDeployer();
  const balance = await deployer.checkBalance();
  console.log(`Wallet balance: ${balance} SOL`);
}
