// jobScraper.js
const { scrapeLinkedIn } = require('./scrapers/scrapeLinkedIn');
const { scrapeIndeed } = require('./scrapers/scrapeIndeed')
const { chromium } = require('playwright');

async function scrapeJobDetails(url) {
  let jobDetails;

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        bypassCSP: true
      });
      const page = await context.newPage();

    await page.goto(url);
    await page.waitForSelector('h1');

    // Determine the site based on the URL
    const site = getSiteFromUrl(url);

    switch (site) {
      case 'linkedin':
        jobDetails = await scrapeLinkedIn(page);
        break;
      case 'indeed':
        jobDetails = await scrapeIndeed(page);
        break;
      default:
        throw new Error('Unsupported job listing site');
    }

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error during job scraping:', error);
  }

  return jobDetails;
}





function getSiteFromUrl(url) {
  if (url.includes('linkedin.com')) {
    return 'linkedin';
  } else if (url.includes('indeed.com')) {
    return 'indeed';
  } else {
    throw new Error('Unsupported job listing site');
  }
}

module.exports = scrapeJobDetails;
