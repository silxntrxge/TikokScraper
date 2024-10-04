import axios from 'axios';
import { getRandomUserAgent } from './constant.js';
import * as cheerio from 'cheerio';

class TikTokScraper {
  constructor(options = {}) {
    this.params = options.params || {};
    this.axios = axios.create({
      headers: {
        'user-agent': options.headers?.['user-agent'] || getRandomUserAgent(),
      },
    });
    this.logger = options.logger || console;
    this.logger.log(`[${new Date().toISOString()}] TikTokScraper: Constructor called with params:`, this.params);
  }

  async scrape(params) {
    this.logger.log('Starting scrape operation...');
    try {
      this.params = { ...this.params, ...params };
      let items = [];
      switch (this.params.type) {
        case 'user':
          this.logger.log('Scraping user feed...');
          items = await this.getUserFeed();
          break;
        case 'hashtag':
          this.logger.log('Scraping hashtag feed...');
          items = await this.getHashtagFeed();
          break;
        case 'trend':
          this.logger.log('Scraping trending feed...');
          items = await this.getTrendingFeed();
          break;
        default:
          throw new Error('Invalid scrape type');
      }

      this.logger.log(`Scrape completed. Found ${items.length} items.`);
      return {
        collector: items,
        // ... (other properties)
      };
    } catch (error) {
      this.logger.error('Error during scrape operation:', error);
      throw error;
    }
  }

  async getUserFeed() {
    this.logger.log('Fetching user feed...');
    // Implement scraping logic for user feed
    // Example placeholder:
    try {
      const url = `https://www.tiktok.com/@${this.params.input}`;
      this.logger.log(`Making request to TikTok API: ${url}`);
      const response = await this.axios.get(url);
      this.logger.log('Received response from TikTok API:', response.status);
      const items = await this.parseResponse(response.data);
      this.logger.log(`Processed ${items.length} items from user feed`);
      return items;
    } catch (error) {
      this.logger.error('Error fetching user feed:', error);
      throw error;
    }
  }

  async getHashtagFeed() {
    this.logger.log(`Fetching hashtag feed for #${this.params.input}...`);
    try {
      const url = `https://www.tiktok.com/tag/${this.params.input}`;
      this.logger.log('Making request to TikTok API:', url);
      const response = await this.makeRequest(url);
      this.logger.log('Received response from TikTok API:', response.status);
      const items = await this.parseResponse(response.data);
      this.logger.log(`Processed ${items.length} items from hashtag feed`);
      return items;
    } catch (error) {
      this.logger.error('Error fetching hashtag feed:', error);
      throw error;
    }
  }

  async getTrendingFeed() {
    this.logger.log('Fetching trending feed...');
    // Implement scraping logic for trending feed
    // Example placeholder:
    try {
      const url = `https://www.tiktok.com/trending`;
      this.logger.log(`Making request to TikTok API: ${url}`);
      const response = await this.axios.get(url);
      this.logger.log('Received response from TikTok API:', response.status);
      const items = await this.parseResponse(response.data);
      this.logger.log(`Processed ${items.length} items from trending feed`);
      return items;
    } catch (error) {
      this.logger.error('Error fetching trending feed:', error);
      throw error;
    }
  }

  async makeRequest(url, retries = 3) {
    this.logger.log(`Making GET request to ${url}`);
    for (let i = 0; i < retries; i++) {
      try {
        this.logger.log(`Attempt ${i + 1} to fetch URL`);
        const response = await this.axios.get(url);
        this.logger.log('Request successful. Response status:', response.status);
        return response;
      } catch (error) {
        this.logger.error(`Request failed (attempt ${i + 1}):`, error.message);
        if (i === retries - 1) throw error;
        this.logger.log(`Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  async parseResponse(html) {
    this.logger.log(`Starting parseResponse method. HTML length: ${html.length}`);

    const $ = cheerio.load(html);
    const collector = [];

    this.logger.log(`Applying cheerio to find video items`);
    
    $('div[data-e2e="challenge-item"]').each((index, element) => {
      const videoContainer = $(element).find('a.css-1wrhn5c-AMetaCaptionLine');
      const videoUrl = videoContainer.attr('href');
      const videoId = videoUrl ? videoUrl.split('/').pop() : null;
      const videoTitle = videoContainer.find('h1.css-198cw7i-H1Container').text().trim();

      if (videoId && videoTitle) {
        collector.push({
          id: videoId,
          title: videoTitle,
          url: videoUrl
        });
        this.logger.log(`Found video item: ID=${videoId}, Title=${videoTitle}`);
      } else {
        this.logger.log(`Found partial match but couldn't extract all info. ID: ${videoId}, Title: ${videoTitle}`);
      }
    });

    this.logger.log(`Parsing complete. Collected items: ${collector.length}`);

    return collector;
  }
}

export default TikTokScraper;