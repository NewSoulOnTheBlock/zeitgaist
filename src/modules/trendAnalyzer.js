/**
 * TrendAnalyzer Module
 * Scores trends for memecoin deployment potential
 * 
 * Scoring factors:
 * - Memeability (is it funny/viral?)
 * - Velocity (how fast is it rising?)
 * - Category fit (crypto/memes > politics/news)
 * - Saturation (already 50 coins about this?)
 * - Sentiment (positive vibes only)
 */

import { config } from '../config.js';

export class TrendAnalyzer {
  constructor() {
    this.recentDeploys = new Set(); // Track recently deployed topics
  }

  /**
   * Analyze and score trends
   * @param {Array} trends - Raw trends from TrendChecker
   * @returns {Array} Scored and sorted trends
   */
  async analyze(trends) {
    const scored = trends.map(trend => {
      const scores = {
        base: this.getBaseScore(trend),
        memeability: this.scoreMemeability(trend),
        category: this.scoreCategoryFit(trend),
        velocity: this.scoreVelocity(trend),
        safety: this.scoreSafety(trend),
      };

      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      const normalized = trend.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        ...trend,
        scores,
        score: Math.min(100, total),
        normalized,
      };
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Base score from tweet volume and rank
   */
  getBaseScore(trend) {
    // Higher rank = lower number = better
    const rankScore = Math.max(0, 20 - trend.rank * 2);
    
    // Parse tweet count (e.g., "125K" -> 125000)
    const tweetCount = this.parseTweetCount(trend.tweets);
    const volumeScore = Math.min(15, Math.log10(tweetCount) * 3);
    
    return rankScore + volumeScore;
  }

  /**
   * Score memeability potential
   */
  scoreMemeability(trend) {
    let score = 0;
    const name = trend.name.toLowerCase();

    // Hashtags are generally more memeable
    if (trend.name.startsWith('#')) score += 5;

    // Short names are more memeable (better tickers)
    if (name.length <= 10) score += 5;
    if (name.length <= 6) score += 5;

    // Contains numbers (often meme-worthy)
    if (/\d/.test(name)) score += 3;

    // All caps energy
    if (trend.name === trend.name.toUpperCase() && trend.name.length > 2) score += 3;

    // Crypto-adjacent terms
    const cryptoTerms = ['coin', 'token', 'moon', 'pump', 'doge', 'pepe', 'wojak', 'chad'];
    if (cryptoTerms.some(t => name.includes(t))) score += 10;

    // Meme culture terms
    const memeTerms = ['based', 'sigma', 'alpha', 'goat', 'king', 'queen', 'lord'];
    if (memeTerms.some(t => name.includes(t))) score += 8;

    return Math.min(25, score);
  }

  /**
   * Score category fit
   */
  scoreCategoryFit(trend) {
    const category = trend.category?.toLowerCase() || 'unknown';
    
    // Best categories
    if (config.PREFER_CATEGORIES.includes(category)) return 15;
    
    // Avoid categories (not blocking, just lower score)
    if (config.AVOID_CATEGORIES.includes(category)) return -10;
    
    return 5; // Neutral
  }

  /**
   * Score trend velocity (rising = good)
   */
  scoreVelocity(trend) {
    // This would use historical data from TrendChecker
    // For now, use rank as proxy (top 5 = probably rising fast)
    if (trend.rank <= 3) return 15;
    if (trend.rank <= 5) return 10;
    if (trend.rank <= 10) return 5;
    return 0;
  }

  /**
   * Safety score (filter out sensitive topics)
   */
  scoreSafety(trend) {
    const name = trend.name.toLowerCase();
    
    // Hard block on sensitive keywords
    if (config.BLOCKED_KEYWORDS.some(kw => name.includes(kw))) {
      return -100; // Instant disqualify
    }

    // Political figures/topics - risky
    const politicalTerms = ['trump', 'biden', 'congress', 'senate', 'election'];
    if (politicalTerms.some(t => name.includes(t))) return -20;

    // Safe = bonus
    return 10;
  }

  /**
   * Parse tweet count strings like "125K" or "1.2M"
   */
  parseTweetCount(str) {
    if (!str || str === 'Unknown') return 1000; // Default to moderate volume
    const num = parseFloat(str);
    if (isNaN(num)) return 1000;
    if (str.includes('K')) return num * 1000;
    if (str.includes('M')) return num * 1000000;
    return num || 1000;
  }
}
