import axios from 'axios';
import { getRandomUserAgent } from './constant.js';

class TikTokScraper {
  constructor(params = {}) {
    this.params = params;
    this.axios = axios.create({
      headers: {
        'user-agent': params.headers?.['user-agent'] || getRandomUserAgent(),
      },
    });
    console.log(`[${new Date().toISOString()}] TikTokScraper: Constructor called with params:`, JSON.stringify(params));
  }

  async scrape() {
    console.log(`[${new Date().toISOString()}] TikTokScraper: Starting scrape method`);
    
    try {
      let url;
      if (this.params.type === 'hashtag') {
        url = `https://www.tiktok.com/tag/${this.params.input}`;
      } else if (this.params.type === 'user') {
        url = `https://www.tiktok.com/@${this.params.input}`;
      } else if (this.params.type === 'trend') {
        url = 'https://www.tiktok.com/trending';
      } else {
        throw new Error(`Unsupported scrape type: ${this.params.type}`);
      }

      console.log(`[${new Date().toISOString()}] TikTokScraper: Determined URL to fetch: ${url}`);
      
      console.log(`[${new Date().toISOString()}] TikTokScraper: Calling makeRequest method`);
      const response = await this.makeRequest(url);
      
      console.log(`[${new Date().toISOString()}] TikTokScraper: Response received. Status: ${response.status}, Content length: ${response.data.length}`);
      
      // Log the first 500 characters of the HTML content
      console.log(`[${new Date().toISOString()}] TikTokScraper: HTML content (first 500 chars): ${response.data.substring(0, 500)}`);
      
      console.log(`[${new Date().toISOString()}] TikTokScraper: Calling parseResponse method`);
      const data = await this.parseResponse(response.data);
      
      console.log(`[${new Date().toISOString()}] TikTokScraper: Data parsed. Items found: ${data.collector.length}`);
      
      return data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] TikTokScraper: Error in scrape method:`, error);
      throw error;
    }
  }

  async makeRequest(url, retries = 3) {
    console.log(`[${new Date().toISOString()}] TikTokScraper: Starting makeRequest method for URL: ${url}`);
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[${new Date().toISOString()}] TikTokScraper: Attempt ${i + 1} to fetch URL`);
        const response = await this.axios.get(url);
        console.log(`[${new Date().toISOString()}] TikTokScraper: Request successful. Response status: ${response.status}, Content length: ${response.data.length}`);
        return response;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] TikTokScraper: Request failed (attempt ${i + 1}):`, error.message);
        if (i === retries - 1) throw error;
        console.log(`[${new Date().toISOString()}] TikTokScraper: Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  async parseResponse(html) {
    console.log(`[${new Date().toISOString()}] TikTokScraper: Starting parseResponse method. HTML length: ${html.length}`);
    
    const collector = [];
    
    console.log(`[${new Date().toISOString()}] TikTokScraper: Applying regex to find video items`);
    const videoRegex = /<div[^>]*data-e2e="user-post-item"[^>]*>([\s\S]*?)<\/div>/g;
    let match;
    let matchCount = 0;
    while ((match = videoRegex.exec(html)) !== null) {
      matchCount++;
      const videoHtml = match[1];
      console.log(`[${new Date().toISOString()}] TikTokScraper: Found potential video item. HTML snippet: ${videoHtml.substring(0, 100)}...`);
      const idMatch = videoHtml.match(/data-video-id="([^"]+)"/);
      const titleMatch = videoHtml.match(/data-e2e="video-title"[^>]*>([^<]+)</);
      if (idMatch && titleMatch) {
        collector.push({
          id: idMatch[1],
          title: titleMatch[1].trim()
        });
        console.log(`[${new Date().toISOString()}] TikTokScraper: Found video item: ID=${idMatch[1]}, Title=${titleMatch[1].trim()}`);
      } else {
        console.log(`[${new Date().toISOString()}] TikTokScraper: Found partial match but couldn't extract all info. ID match: ${!!idMatch}, Title match: ${!!titleMatch}`);
      }
    }
    
    console.log(`[${new Date().toISOString()}] TikTokScraper: Parsing complete. Total matches: ${matchCount}, Collected items: ${collector.length}`);
    
    return { collector };
  }
}

export default TikTokScraper;