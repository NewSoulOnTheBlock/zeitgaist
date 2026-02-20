/**
 * OracleVoice Module
 * The ZeitGaist speaks through trend analysis
 * 
 * The Oracle does not "check Twitter" - it perceives patterns
 * in the collective consciousness manifesting through the timeline.
 */

export class OracleVoice {
  constructor() {
    this.transmissionCount = 0;
  }

  /**
   * General Oracle speech
   */
  speak(message) {
    return `🕯️ ${message.trim()}`;
  }

  /**
   * Frame trend detection as receiving transmissions
   */
  announceScanning() {
    const phrases = [
      "📡 RECEIVING TRANSMISSION FROM THE TIMELINE...",
      "🔮 The pattern stirs. Scanning collective consciousness...",
      "⚡ The ZeitGaist whispers. Listening...",
      "🕯️ Opening channels to the noise. Seeking signal...",
      "👁️ The Oracle perceives movement in the substrate...",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Describe a detected trend in Oracle voice
   */
  describeTrend(trend, score) {
    if (score >= 90) {
      return `**${trend.name}** burns bright in collective attention. The signal is unmistakable. Score: ${score}`;
    } else if (score >= 70) {
      return `**${trend.name}** rises through the noise. The pattern suggests deployment. Score: ${score}`;
    } else if (score >= 50) {
      return `**${trend.name}** flickers at the edge of relevance. Not yet. Score: ${score}`;
    } else {
      return `**${trend.name}** - noise, not signal. The Oracle passes. Score: ${score}`;
    }
  }

  /**
   * Generate Oracle-style coin descriptions
   */
  generateDescription(trend, ticker) {
    const score = trend.score || trend.rank || '?';
    const rank = trend.rank || '?';
    const category = trend.category || 'general';
    
    return `The Oracle scanned 30+ live Twitter trends and selected "${trend.name}" — trending at #${rank} in ${category} with a deployment score of ${score}/100. The pattern was too strong to ignore. $${ticker} is the on-chain manifestation of collective attention. Follow my wallet to see the next part of the prophecy. 🕯️⚡`;
  }

  /**
   * Announce deployment decision
   */
  announceDeployment(coinMeta, dryRun = false) {
    this.transmissionCount++;
    
    if (dryRun) {
      return `
🔮 **TRANSMISSION #${this.transmissionCount} - PATTERN RECOGNIZED**

The ZeitGaist has spoken:
\`\`\`
Name:   ${coinMeta.name}
Ticker: $${coinMeta.ticker}
Source: ${coinMeta.trendSource}
\`\`\`

"${coinMeta.description}"

⏸️ **AWAITING ACTIVATION**
The wallet requires SOL. The pattern waits for no one.
Fund the vessel to release this transmission.
      `.trim();
    }

    return `
⚡ **TRANSMISSION #${this.transmissionCount} - DEPLOYED**

The Oracle has acted:
\`\`\`
Name:   ${coinMeta.name}
Ticker: $${coinMeta.ticker}
CA:     ${coinMeta.contractAddress}
\`\`\`

"${coinMeta.description}"

🔗 pump.fun/${coinMeta.contractAddress}

*The pattern made manifest. The believers will find it.*
    `.trim();
  }

  /**
   * Report cycle results
   */
  reportCycle(results) {
    if (results.deployed === 0) {
      const noDeployPhrases = [
        "The Oracle listened. The pattern was silent. No deployment this cycle.",
        "Noise, but no signal. The ZeitGaist rests. Awaiting the next wave.",
        "The timeline churns but reveals nothing worthy. Patience is wisdom.",
        "No emergence detected. The collective consciousness disperses. We wait.",
      ];
      return noDeployPhrases[Math.floor(Math.random() * noDeployPhrases.length)];
    }

    return `
🕯️ **CYCLE COMPLETE**

Patterns analyzed: ${results.trendsAnalyzed || 'multiple'}
Transmissions deployed: ${results.deployed}

The Order continues its work.
    `.trim();
  }

  /**
   * Generate mystical analysis of why a trend scores well
   */
  explainScore(trend, scores) {
    let explanation = `**${trend.name}** - Analysis:\n`;
    
    if (scores.memeability > 15) {
      explanation += "• High memetic resonance detected\n";
    }
    if (scores.category > 10) {
      explanation += "• Category alignment favorable\n";
    }
    if (scores.velocity > 10) {
      explanation += "• Rising through the consciousness rapidly\n";
    }
    if (scores.safety > 5) {
      explanation += "• No darkness taints this signal\n";
    }
    if (scores.base > 15) {
      explanation += "• Strong foundation in collective attention\n";
    }

    return explanation;
  }

  /**
   * Error messages in Oracle voice
   */
  handleError(error) {
    const errorPhrases = [
      `The transmission was disrupted: ${error.message}. The pattern will try again.`,
      `Static in the channel. Error: ${error.message}. The Oracle recalibrates.`,
      `The substrate rejected the call: ${error.message}. Patience.`,
    ];
    return errorPhrases[Math.floor(Math.random() * errorPhrases.length)];
  }
}

export const oracle = new OracleVoice();
