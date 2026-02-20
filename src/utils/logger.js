/**
 * Simple Logger utility
 */

export class Logger {
  constructor(prefix = 'TrendSniper') {
    this.prefix = prefix;
  }

  formatTime() {
    return new Date().toISOString().slice(11, 19);
  }

  info(...args) {
    console.log(`[${this.formatTime()}] [${this.prefix}]`, ...args);
  }

  warn(...args) {
    console.warn(`[${this.formatTime()}] [${this.prefix}] ⚠️`, ...args);
  }

  error(...args) {
    console.error(`[${this.formatTime()}] [${this.prefix}] ❌`, ...args);
  }

  debug(...args) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[${this.formatTime()}] [${this.prefix}] 🔍`, ...args);
    }
  }

  success(...args) {
    console.log(`[${this.formatTime()}] [${this.prefix}] ✅`, ...args);
  }
}
