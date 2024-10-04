#!/usr/bin/env node

import express from 'express';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import TikTokScraper from '../build/tiktok-scraper.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
import { getRandomUserAgent } from '../build/constant.js';
import { fileURLToPath } from 'url';

console.log(`[${new Date().toISOString()}] CLI script started`);

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> [options]')
    .command('scrape', 'Scrape TikTok', (yargs) => {
        return yargs
            .option('type', {
                describe: 'Type of scrape',
                type: 'string',
                choices: ['user', 'hashtag', 'trend'],
                demandOption: true
            })
            .option('input', {
                describe: 'Input for scraping (username, hashtag, or trend)',
                type: 'string',
                demandOption: true
            })
            .option('count', {
                describe: 'Number of items to scrape',
                type: 'number',
                default: 10
            });
    })
    .command('trend', 'Scrape Trending TikToks', (yargs) => {
        return yargs
            .option('count', {
                describe: 'Number of trending items to scrape',
                type: 'number',
                default: 10
            })
            .option('download', {
                describe: 'Download the scraped items',
                type: 'boolean',
                default: false
            });
    })
    .help()
    .alias('help', 'h')
    .version(version)
    .parse();

const app = express();
const defaultPort = 10000;

app.use(express.json());

const scraperInstance = new TikTokScraper();

// Define routes for Express
app.post('/scrape', async (req, res) => {
    try {
        const { type, input, count } = req.body;
        const params = {
            type,
            input,
            count: count || 10,
            download: false,
            filepath: '',
            filetype: '',
            proxy: '',
            asyncDownload: 5,
            asyncScraping: 3,
            cli: false,
            event: false,
            progress: false,
            headers: {
                'user-agent': getRandomUserAgent(),
            },
        };
        const result = await scraperInstance.scrape(type, params);
        res.json(result);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'An error occurred during scraping' });
    }
});

// Function to start scraping via CLI
async function startScraper() {
    console.log(`[${new Date().toISOString()}] CLI: Starting scraper with args:`, argv);
    try {
        let params = {
            download: false,
            filepath: '',
            filetype: '',
            proxy: '',
            asyncDownload: 5,
            asyncScraping: 3,
            cli: true,
            event: false,
            progress: false,
            headers: {
                'user-agent': getRandomUserAgent(),
            },
        };

        if (argv._.includes('scrape')) {
            params = {
                ...params,
                type: argv.type,
                input: argv.input,
                count: argv.count,
            };
            console.log(`[${new Date().toISOString()}] CLI: Scraping with params:`, params);
            
            console.log(`[${new Date().toISOString()}] CLI: Initializing scraper...`);
            const scraper = new TikTokScraper(params);
            console.log(`[${new Date().toISOString()}] CLI: Scraper initialized. Starting scrape...`);
            
            try {
                console.log(`[${new Date().toISOString()}] CLI: Calling scrape method...`);
                const result = await scraper.scrape();
                console.log(`[${new Date().toISOString()}] CLI: Scraping completed. Result:`, JSON.stringify(result, null, 2));
                
                if (result && result.collector && result.collector.length > 0) {
                    console.log(`[${new Date().toISOString()}] CLI: Scraped ${result.collector.length} items.`);
                    console.log(JSON.stringify({ success: true, data: result }));
                } else {
                    console.log(`[${new Date().toISOString()}] CLI: No items scraped. Result:`, JSON.stringify(result, null, 2));
                    console.log(JSON.stringify({ success: false, message: 'No items scraped', data: result }));
                }
            } catch (scrapeError) {
                console.error(`[${new Date().toISOString()}] CLI: Error during scraping:`, scrapeError);
                console.log(JSON.stringify({ success: false, error: scrapeError.message }));
            }
        } else {
            console.error(`[${new Date().toISOString()}] CLI: Invalid command. Use --help to see available commands.`);
            console.log(JSON.stringify({ success: false, error: 'Invalid command' }));
            process.exit(1);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] CLI: Error during scraping:`, error);
        if (error.response) {
            console.error(`[${new Date().toISOString()}] CLI: Error response:`, error.response.data);
        }
        console.log(JSON.stringify({ success: false, error: error.message }));
    }
}

// Determine if the script is being run directly or imported
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(`[${new Date().toISOString()}] CLI script running directly`);
    console.log(`[${new Date().toISOString()}] Starting CLI scraper mode`);
    // Run the CLI scraper for other commands
    startScraper().then(() => {
        console.log(`[${new Date().toISOString()}] CLI scraper finished, exiting`);
        process.exit(0);
    });
}

export default app;