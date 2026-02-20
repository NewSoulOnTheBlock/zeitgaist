/**
 * ImageScraper Module
 * Fetches relevant images for trending topics via Google Images
 * 
 * The Oracle does not use placeholders. The Oracle manifests
 * with the imagery the collective consciousness has already created.
 */

export class ImageScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Fetch an image for a trend topic
   * @param {string} trendName - The trending topic name
   * @returns {Blob|null} Image blob ready for upload
   */
  async fetchImageForTrend(trendName) {
    try {
      const imageUrl = await this.findBestImage(trendName);
      if (!imageUrl) {
        console.warn(`No image found for "${trendName}", using placeholder`);
        return null;
      }

      console.log(`🖼️ Fetching image for "${trendName}": ${imageUrl.substring(0, 80)}...`);
      
      const resp = await fetch(imageUrl, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(10000),
      });

      if (!resp.ok) {
        console.warn(`Image fetch failed (${resp.status}), trying next...`);
        return null;
      }

      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        console.warn('Response is not an image');
        return null;
      }

      const buffer = await resp.arrayBuffer();
      if (buffer.byteLength < 1000) {
        console.warn('Image too small, likely broken');
        return null;
      }

      return new Blob([buffer], { type: contentType });
    } catch (e) {
      console.warn(`Image scraping failed for "${trendName}":`, e.message);
      return null;
    }
  }

  /**
   * Search Google Images and find the best image URL
   */
  async findBestImage(query) {
    const searchQuery = encodeURIComponent(query.replace(/^#/, ''));
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m`;

    const resp = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`Google Images HTTP ${resp.status}`);
    
    const html = await resp.text();
    const urls = this.extractImageUrls(html);

    // Try each URL until we find one that works
    for (const imgUrl of urls.slice(0, 10)) {
      if (this.isGoodUrl(imgUrl)) return imgUrl;
    }

    return urls[0] || null;
  }

  /**
   * Extract image URLs from Google Images HTML
   */
  extractImageUrls(html) {
    const patterns = [
      /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\d+,\d+\]/gi,
      /ou":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      /src="(https?:\/\/encrypted-tbn[^"]+)"/gi,
    ];

    const urls = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let imgUrl = match[1];
        // Clean up escaped characters
        imgUrl = imgUrl.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
        
        if (this.isValidImageUrl(imgUrl)) {
          urls.add(imgUrl);
        }
      }
    }

    return [...urls];
  }

  /**
   * Check if URL is a valid image URL worth using
   */
  isValidImageUrl(url) {
    if (!url || url.length > 500) return false;
    if (url.includes('google.com/images')) return false;
    if (url.includes('gstatic.com/images')) return false;
    if (url.includes('favicon')) return false;
    if (url.includes('logo') && url.includes('google')) return false;
    return true;
  }

  /**
   * Check if URL is likely to be a good content image
   */
  isGoodUrl(url) {
    // Prefer larger images from news/media sites
    const goodDomains = ['images', 'cdn', 'media', 'static', 'img', 'photo', 'pic'];
    const urlLower = url.toLowerCase();
    return goodDomains.some(d => urlLower.includes(d)) || urlLower.match(/\.(?:jpg|jpeg|png|webp)/);
  }

  /**
   * Get search instructions (legacy, for reference)
   */
  getSearchInstructions(trendName) {
    return `Search Google Images for "${trendName}" and download a relevant image`;
  }
}
