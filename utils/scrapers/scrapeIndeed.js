const { By, until } = require('selenium-webdriver');

async function scrapeIndeed(driver) {
  let jobDetails;

  try {
    // Wait for the job title to be visible
    await driver.wait(until.elementLocated(By.css('.jobsearch-JobInfoHeader-title')), 10000); // Increased timeout to 10 seconds

    // Extract job details
    jobDetails = await driver.executeScript(() => {
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : 'n/a';
      };

      const getPayScale = () => {
        const payElement = document.querySelector('.jobsearch-JobMetadataHeader-item');
        if (payElement) {
          const payText = payElement.innerText.trim();
          return payText;
        }
        return 'n/a';
      };

      const jobTypeElement = document.querySelector('.jobsearch-JobMetadataHeader-item');
      const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : 'n/a';

      const remote = jobTypeElement && jobTypeElement.textContent.includes('Remote') ? 'yes' : 'no';

      const location = getText('.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)');
      let city = 'Remote';
      let state = 'NA';

      // Parse location into city and state
      if (location.includes(',')) {
        const parts = location.split(',').map(part => part.trim());
        city = parts[0];
        state = parts[1];
      } else if (location.toLowerCase().includes('united states')) {
        state = 'NA'; // or handle based on your specific logic
      }

      return {
        companyName: getText('.jobsearch-CompanyReview--heading'),
        jobTitle: getText('.jobsearch-JobInfoHeader-title'),
        city,
        state,
        jobType,
        remote,
        jobSite: 'Indeed',
        payType: document.querySelector('.jobsearch-JobMetadataHeader-item') ? 'salary' : 'n/a',
        payScale: getPayScale(),
        payAmount: getPayScale(),
        notes: getText('.jobsearch-JobComponent-description')
      };
    });

  } catch (error) {
    console.error('Error during Indeed scraping:', error);
    jobDetails = {
      companyName: 'n/a',
      jobTitle: 'n/a',
      city: 'n/a',
      state: 'n/a',
      jobType: 'n/a',
      remote: 'no',
      jobSite: 'Indeed',
      payType: 'n/a',
      payScale: 'n/a',
      payAmount: 'n/a',
      notes: 'n/a'
    };
  }

  return jobDetails;
}

module.exports = { scrapeIndeed };
