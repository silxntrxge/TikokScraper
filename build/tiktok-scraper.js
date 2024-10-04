import axios from 'axios';
import { getRandomUserAgent } from './constant.js';
import fs from 'fs';

const logFile = fs.createWriteStream('scraper-details.log', { flags: 'a' });

function detailedLog(message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    logFile.write(logMessage + '\n');
    if (data) {
        const dataString = JSON.stringify(data, null, 2);
        console.log(dataString);
        logFile.write(dataString + '\n');
    }
}

class TikTokScraper {
  constructor(options = {}) {
    this.params = options.params || {};
    this.axios = axios.create({
      headers: {
        'user-agent': options.headers?.['user-agent'] || getRandomUserAgent(),
      },
    });
    this.logger = options.logger || console;
    detailedLog(`TikTokScraper: Constructor called with params:`, options);
  }

  async scrape() {
    detailedLog('Starting scrape operation...');
    try {
      let items = [];
      switch (this.params.type) {
        case 'user':
          detailedLog('Scraping user feed...');
          items = await this.getUserFeed();
          break;
        case 'hashtag':
          detailedLog('Scraping hashtag feed...');
          items = await this.getHashtagFeed();
          break;
        case 'trend':
          detailedLog('Scraping trending feed...');
          items = await this.getTrendingFeed();
          break;
        default:
          throw new Error('Invalid scrape type');
      }

      detailedLog(`Scrape completed. Found ${items.length} items.`);
      return {
        collector: items,
        // ... (other properties)
      };
    } catch (error) {
      detailedLog('Error during scrape operation:', error);
      throw error;
    }
  }

  async getUserFeed() {
    this.logger.log('Fetching user feed...');
    // ... (existing code)
  }

  async getHashtagFeed() {
    detailedLog(`Fetching hashtag feed for #${this.params.input}...`);
    try {
      const url = `https://www.tiktok.com/tag/${this.params.input}`;
      detailedLog('Making request to TikTok API...', { url });
      const response = await this.makeRequest(url);
      detailedLog('Received response from TikTok API', { status: response.status });
      const items = await this.parseResponse(response.data);
      detailedLog(`Processed ${items.collector.length} items from hashtag feed`);
      return items.collector;
    } catch (error) {
      detailedLog('Error fetching hashtag feed:', error);
      throw error;
    }
  }

  async getTrendingFeed() {
    this.logger.log('Fetching trending feed...');
    // ... (existing code)
  }

  async makeRequest(url, retries = 3) {
    detailedLog(`Making GET request to ${url}`);
    for (let i = 0; i < retries; i++) {
      try {
        detailedLog(`Attempt ${i + 1} to fetch URL`);
        const response = await this.axios.get(url);
        detailedLog('Request successful. Response status:', response.status);
        return response;
      } catch (error) {
        detailedLog(`Request failed (attempt ${i + 1}):`, error.message);
        if (i === retries - 1) throw error;
        detailedLog(`Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  async parseResponse(html) {
    detailedLog(`Starting parseResponse method. HTML length: ${html.length}`);
    
    const collector = [];
    
    detailedLog(`Applying regex to find video items`);
    const videoRegex = /<div[^>]*data-e2e="user-post-item"[^>]*>([\s\S]*?)<\/div>/g;
    let match;
    let matchCount = 0;
    while ((match = videoRegex.exec(html)) !== null) {
      matchCount++;
      const videoHtml = match[1];
      detailedLog(`Found potential video item. HTML snippet: ${videoHtml.substring(0, 100)}...`);
      const idMatch = videoHtml.match(/data-video-id="([^"]+)"/);
      const titleMatch = videoHtml.match(/data-e2e="video-title"[^>]*>([^<]+)</);
      if (idMatch && titleMatch) {
        collector.push({
          id: idMatch[1],
          title: titleMatch[1].trim()
        });
        detailedLog(`Found video item: ID=${idMatch[1]}, Title=${titleMatch[1].trim()}`);
      } else {
        detailedLog(`Found partial match but couldn't extract all info. ID match: ${!!idMatch}, Title match: ${!!titleMatch}`);
      }
    }
    
    detailedLog(`Parsing complete. Total matches: ${matchCount}, Collected items: ${collector.length}`);
    
    return { collector };
  }

  async request(uri, method, qs = {}) {
    this.logger.log(`Making ${method} request to ${uri}`);
    try {
      // ... (existing request code)
      this.logger.log('Request successful');
      return response;
    } catch (error) {
      this.logger.error('Request failed:', error);
      throw error;
    }
  }
}

export default TikTokScraper;