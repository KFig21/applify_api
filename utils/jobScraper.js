const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromeLambda = require('chrome-aws-lambda');

const { scrapeLinkedIn } = require('./scrapers/scrapeLinkedIn');
const { scrapeIndeed } = require('./scrapers/scrapeIndeed');

async function scrapeJobDetails(url) {
  let jobDetails;
  let driver;
  console.log('scrapeJobDetails');

  try {
    // Configure Chrome options for Heroku
    let chromeOptions = new chrome.Options()
      .setChromeBinaryPath(await chromeLambda.executablePath) // Use chrome-aws-lambda binary
      .addArguments('--headless') // Run in headless mode
      .addArguments('--no-sandbox') // Bypass OS security model
      .addArguments('--disable-dev-shm-usage') // Overcome limited resource problems
      .addArguments('--disable-gpu')
      .addArguments('--disable-web-security') // Disable web security
      .addArguments('--ignore-certificate-errors') // Ignore certificate errors
      .addArguments('--disable-infobars') // Disable infobars
      .addArguments('--disable-extensions') // Disable extensions
      .addArguments('--remote-debugging-port=9222') // Enable remote debugging
      .addArguments(
        `user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36`
      );

    // Initialize WebDriver using the configured options
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    // Navigate to the job listing URL
    await driver.get(url);

    // Wait for the job title to be visible
    await driver.wait(until.elementLocated(By.css('h1')), 10000);

    // Determine the site based on the URL
    const site = getSiteFromUrl(url);

    switch (site) {
      case 'linkedin':
        jobDetails = await scrapeLinkedIn(driver);
        break;
      case 'indeed':
        jobDetails = await scrapeIndeed(driver);
        break;
      default:
        throw new Error('Unsupported job listing site');
    }
  } catch (error) {
    console.error('Error during job scraping:', error);
  } finally {
    // Ensure browser is closed
    if (driver) {
      await driver.quit();
    }
  }

  return jobDetails || {
    companyName: 'n/a',
    jobTitle: 'n/a',
    city: 'n/a',
    state: 'n/a',
    jobType: 'n/a',
    remote: 'no',
    jobSite: site ? site.charAt(0).toUpperCase() + site.slice(1) : 'n/a', // Capitalize site name
    payType: 'n/a',
    payScale: 'n/a',
    payAmount: 'n/a',
    notes: 'n/a'
  };
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
