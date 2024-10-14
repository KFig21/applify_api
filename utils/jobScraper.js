const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const { scrapeLinkedIn } = require('./scrapers/scrapeLinkedIn');
const { scrapeIndeed } = require('./scrapers/scrapeIndeed');

async function scrapeJobDetails(url) {
  let jobDetails;
console.log('scrapeJobDetails')
  // Configure Chrome options
  let chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--headless'); // Run in headless mode
  chromeOptions.addArguments('--no-sandbox'); // Bypass OS security model
  chromeOptions.addArguments('--disable-dev-shm-usage'); // Overcome limited resources problems
  chromeOptions.addArguments("--disable-gpu")
  chromeOptions.addArguments(`user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36`);
  chromeOptions.addArguments('--disable-web-security'); // Disable web security
  chromeOptions.addArguments('--ignore-certificate-errors'); // Ignore certificate errors
  chromeOptions.addArguments('--disable-infobars'); // Disable infobars
  try {
    // Initialize WebDriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    // Your test code goes here
    await driver.get('http://www.example.com');
  } catch (error) {
      // Handle initialization error
      console.error('Failed to initialize WebDriver:', error.message);
      if (error.name === 'SessionNotCreatedError') {
          console.error('Check that the ChromeDriver version matches the installed Chrome version.');
      } else {
          console.error('An unexpected error occurred:', error);
      }
  } finally {
      if (driver) {
          await driver.quit();
      }
  }

  try {
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
    // Close the browser
    await driver.quit();
  }

  return jobDetails || {
    companyName: 'n/a',
    jobTitle: 'n/a',
    city: 'n/a',
    state: 'n/a',
    jobType: 'n/a',
    remote: 'no',
    jobSite: site.charAt(0).toUpperCase() + site.slice(1), // Capitalize site name
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
