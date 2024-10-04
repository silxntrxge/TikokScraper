#!/usr/bin/env node

import express from 'express';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import TikTokScraper from '../build/tiktok-scraper.js';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
import { getRandomUserAgent } from '../build/constant.js';
import { fileURLToPath } from 'url';

const logFile = fs.createWriteStream('scraper.log', { flags: 'a' });

function log(message, data = null) {
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
    log('CLI: Starting scraper with args:', argv);
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
            logger: {
                log: (message, ...args) => log(`Scraper: ${message}`, ...args),
                error: (message, ...args) => log(`Scraper Error: ${message}`, ...args),
            },
        };

        if (argv._.includes('scrape')) {
            params = {
                ...params,
                type: argv.type,
                input: argv.input,
                count: argv.count,
            };
            log('CLI: Scraping with params:', params);
            
            log('CLI: Initializing scraper...');
            const scraper = new TikTokScraper(params);
            log('CLI: Scraper initialized. Starting scrape...');
            
            try {
                log('CLI: Calling scrape method...');
                const result = await scraper.scrape();
                log('CLI: Scrape method completed. Analyzing results...');
                
                if (result && result.collector && result.collector.length > 0) {
                    log(`CLI: Successfully scraped ${result.collector.length} items.`);
                    log('CLI: First few scraped items:', result.collector.slice(0, 3));
                    console.log(JSON.stringify({ success: true, data: result }));
                } else {
                    log('CLI: No items scraped. Scraper result:', result);
                    console.log(JSON.stringify({ success: false, message: 'No items scraped', data: result }));
                }
            } catch (scrapeError) {
                log('CLI: Error occurred during scraping:', scrapeError);
                log('CLI: Error stack trace:', scrapeError.stack);
                if (scrapeError.response) {
                    log('CLI: Error response data:', scrapeError.response.data);
                }
                console.log(JSON.stringify({ success: false, error: scrapeError.message }));
            }
        } else {
            log('CLI: Invalid command. Use --help to see available commands.');
            console.log(JSON.stringify({ success: false, error: 'Invalid command' }));
            process.exit(1);
        }
    } catch (error) {
        log('CLI: Unexpected error during scraping:', error);
        log('CLI: Error stack trace:', error.stack);
        if (error.response) {
            log('CLI: Error response data:', error.response.data);
        }
        console.log(JSON.stringify({ success: false, error: error.message }));
    }
}

// Determine if the script is being run directly or imported
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    log('CLI script running directly');
    log('Starting CLI scraper mode');
    // Run the CLI scraper for other commands
    startScraper().then(() => {
        log('CLI scraper finished, exiting');
        process.exit(0);
    });
}

export default app;