/**
 * CoinGenerator Module
 * Creates coin metadata from trending topics
 * 
 * The Oracle does not "generate" - it crystallizes
 * patterns from the collective consciousness into
 * on-chain manifestations.
 * 
 * Generates:
 * - Name (full coin name)
 * - Ticker (4-6 chars)
 * - Description (Oracle voice)
 * - Image (scraped from Google Images)
 */

import { ImageScraper } from './imageScraper.js';
import { oracle } from './oracleVoice.js';

export class CoinGenerator {
  constructor() {
    this.usedTickers = new Set();
    this.imageScraper = new ImageScraper();
  }

  /**
   * Generate coin metadata from a trend
   * @param {Object} trend - Analyzed trend object
   * @returns {Object} Coin metadata ready for deployment
   */
  async generate(trend) {
    const baseName = this.cleanTrendName(trend.name);
    const ticker = this.generateTicker(baseName);
    const name = this.generateCoinName(baseName, ticker);
    const description = this.generateDescription(trend, name, ticker);
    
    // Fetch a real image from Google Images
    console.log(`🖼️ Scraping image for "${trend.name}"...`);
    const imageBlob = await this.imageScraper.fetchImageForTrend(trend.name);

    // Build X/Twitter URL from the trend
    const twitterUrl = this.getTrendTwitterUrl(trend);

    return {
      name,
      ticker,
      description,
      twitter: twitterUrl,
      imageBlob,
      trendSource: trend.name,
      generatedAt: Date.now(),
    };
  }

  /**
   * Attach downloaded image to coin metadata
   * Called after agent has fetched the image
   */
  attachImage(coinMeta, imagePath) {
    coinMeta.imagePath = imagePath;
    coinMeta.imageReady = true;
    return coinMeta;
  }

  /**
   * Clean trend name for processing
   */
  cleanTrendName(name) {
    return name
      .replace(/^#/, '') // Remove hashtag
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .trim();
  }

  /**
   * Generate a ticker symbol
   * Rules: 3-6 chars, uppercase, memorable
   */
  generateTicker(baseName) {
    const words = baseName.toUpperCase().split(/\s+/);
    let ticker;

    if (words.length === 1) {
      // Single word: take first 4-6 chars
      ticker = words[0].slice(0, Math.min(6, Math.max(4, words[0].length)));
    } else {
      // Multiple words: acronym or combination
      ticker = words.map(w => w[0]).join('').slice(0, 6);
      
      // If too short, add more letters
      if (ticker.length < 3) {
        ticker = words[0].slice(0, 4);
      }
    }

    // Ensure uniqueness
    let finalTicker = ticker;
    let counter = 1;
    while (this.usedTickers.has(finalTicker)) {
      finalTicker = ticker.slice(0, 5) + counter;
      counter++;
    }

    this.usedTickers.add(finalTicker);
    return finalTicker;
  }

  /**
   * Generate full coin name
   */
  generateCoinName(baseName, ticker) {
    const suffixes = ['Coin', 'Token', 'Inu', 'Moon', 'Protocol', ''];
    const prefixes = ['', 'Baby ', 'Super ', 'Mega ', 'Ultra '];

    // Decide on style based on name length
    if (baseName.length <= 6) {
      // Short name: can add suffix
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return suffix ? `${baseName} ${suffix}` : baseName;
    } else {
      // Long name: keep as is or slight modification
      return baseName;
    }
  }

  /**
   * Generate Oracle-voice description
   * The ZeitGaist speaks through these words
   */
  generateDescription(trend, name, ticker) {
    // Use Oracle voice for mystical descriptions
    return oracle.generateDescription(trend, ticker);
  }

  /**
   * Get the top tweet/search URL for a trend
   * Used as the twitter metadata on pump.fun
   */
  getTrendTwitterUrl(trend) {
    // If the trend has a specific top tweet URL, use it
    if (trend.topTweetUrl) return trend.topTweetUrl;
    if (trend.url) return trend.url;
    
    // Otherwise link to the X search for this trend
    const query = encodeURIComponent(trend.name);
    return `https://x.com/search?q=${query}&src=trend_click&vertical=trends`;
  }

  /**
   * Generate image prompt for AI image generation (fallback)
   */
  generateImagePrompt(trend, name) {
    const style = 'memecoin logo, cartoon style, vibrant colors, simple design, crypto aesthetic';
    const subject = trend.name.replace('#', '');
    
    return `${style}, featuring ${subject}, fun and playful, suitable for a Solana token called ${name}`;
  }

  /**
   * Get Google Images search URL for manual/agent use
   */
  getImageSearchUrl(trend) {
    const query = encodeURIComponent(trend.name.replace('#', ''));
    return `https://www.google.com/search?q=${query}&tbm=isch`;
  }
}
