/**
 * TrendChecker Module
 * Fetches REAL trending topics from Twitter/X
 * 
 * Sources:
 * 1. getdaytrends.com - structured, ranked US trends
 * 2. trends24.in - backup
 */

import { config } from '../config.js';

export class TrendChecker {
  constructor() {
    this.lastTrends = [];
    this.trendHistory = new Map();
  }

  async getTrends() {
    try {
      return await this.getTrendsFromGetDayTrends();
    } catch (e) {
      console.warn('getdaytrends failed:', e.message);
      try {
        return await this.getTrendsFromTrends24();
      } catch (e2) {
        console.warn('trends24 failed:', e2.message);
        return [];
      }
    }
  }

  async getTrendsFromGetDayTrends() {
    const resp = await fetch('https://getdaytrends.com/united-states/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    
    const html = await resp.text();
    const pattern = /\/united-states\/trend\/([^/]+)\//g;
    const seen = new Set();
    const trends = [];
    let match;
    let rank = 0;

    while ((match = pattern.exec(html)) !== null) {
      const name = decodeURIComponent(match[1]).replace(/%20/g, ' ').trim();
      const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (seen.has(normalized) || !name) continue;
      seen.add(normalized);
      rank++;

      trends.push({
        name,
        normalized,
        tweets: 'Unknown',
        category: this.categorizeTrend(name),
        rank,
        url: `https://x.com/search?q=${encodeURIComponent(name)}&src=trend_click`,
        source: 'getdaytrends'
      });

      if (rank >= 30) break;
    }

    if (trends.length === 0) throw new Error('No trends parsed');

    console.log(`📡 Fetched ${trends.length} LIVE trends from getdaytrends.com`);
    this.lastTrends = trends;
    return trends;
  }

  async getTrendsFromTrends24() {
    const resp = await fetch('https://trends24.in/united-states/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const html = await resp.text();
    const pattern = /twitter\.com\/search\?q=([^"&]+)/g;
    const seen = new Set();
    const trends = [];
    let match;
    let rank = 0;

    while ((match = pattern.exec(html)) !== null) {
      const name = decodeURIComponent(match[1]).replace(/\+/g, ' ').trim();
      const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (seen.has(normalized) || !name) continue;
      seen.add(normalized);
      rank++;

      trends.push({
        name,
        normalized,
        tweets: 'Unknown',
        category: this.categorizeTrend(name),
        rank,
        url: `https://x.com/search?q=${encodeURIComponent(name)}&src=trend_click`,
        source: 'trends24'
      });

      if (rank >= 30) break;
    }

    if (trends.length === 0) throw new Error('No trends parsed');

    console.log(`📡 Fetched ${trends.length} LIVE trends from trends24.in`);
    this.lastTrends = trends;
    return trends;
  }

  categorizeTrend(name) {
    const lower = name.toLowerCase();
    const categories = {
      crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'crypto', 'token', 'nft', 'defi', 'web3', 'blockchain', 'doge'],
      politics: ['trump', 'biden', 'democrat', 'republican', 'congress', 'senate', 'scotus', 'supreme court', 'tariff', 'election', 'maga', 'vote', 'impeach'],
      tech: ['ai', 'chatgpt', 'openai', 'apple', 'google', 'microsoft', 'nvidia', 'iphone', 'android', 'elon'],
      entertainment: ['movie', 'netflix', 'disney', 'album', 'tour', 'concert', 'grammy', 'oscar', 'anime', 'manga', 'kdrama'],
      sports: ['nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'super bowl', 'playoffs', 'ufc'],
      gaming: ['nintendo', 'playstation', 'xbox', 'pokemon', 'pokémon', 'zelda', 'mario', 'switch', 'steam', 'gaming', 'nier'],
      memes: ['meme', 'viral', 'lmao', 'bruh', 'ratio', 'based'],
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return 'general';
  }

  calculateVelocity(trend) {
    const key = trend.name.toLowerCase();
    const history = this.trendHistory.get(key) || [];
    
    if (history.length < 2) {
      this.trendHistory.set(key, [...history, { rank: trend.rank, time: Date.now() }]);
      return 0;
    }

    const latest = history[history.length - 1];
    const rankDelta = latest.rank - trend.rank;
    const updated = [...history, { rank: trend.rank, time: Date.now() }].slice(-6);
    this.trendHistory.set(key, updated);
    return rankDelta;
  }
}
