const { By, until } = require('selenium-webdriver');

async function scrapeLinkedIn(driver) {
  let jobDetails;

  try {
    // Wait for the job title to be visible
    await driver.wait(until.elementLocated(By.css('.topcard__title')), 1000);

    // Extract job details
    jobDetails = await driver.executeScript(() => {
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : 'n/a';
      };

      const getPayScale = () => {
        const payElement = document.querySelector('.salary-text');
        if (payElement) {
          const payText = payElement.innerText.trim();
          return payText;
        }
        return 'n/a';
      };

      const jobTypeElement = document.querySelector('.job-type-text');
      const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : 'n/a';

      const remoteElement = document.querySelector('.location-text');
      const remote = remoteElement && remoteElement.textContent.includes('Remote') ? 'yes' : 'no';

      const locationElement = document.querySelector('.location-text');
      const location = locationElement ? locationElement.textContent.trim() : 'n/a';
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
        companyName: getText('.topcard__org-name-link'),
        jobTitle: getText('.topcard__title'),
        city,
        state,
        jobType,
        remote,
        jobSite: 'LinkedIn',
        payType: document.querySelector('.salary-text') ? 'salary' : 'n/a',
        payScale: getPayScale(),
        payAmount: getPayScale(),
        notes: getText('.description__text')
      };
    });

  } catch (error) {
    console.error('Error during LinkedIn scraping:', error);
    jobDetails = {
      companyName: 'n/a',
      jobTitle: 'n/a',
      city: 'n/a',
      state: 'n/a',
      jobType: 'n/a',
      remote: 'no',
      jobSite: 'LinkedIn',
      payType: 'n/a',
      payScale: 'n/a',
      payAmount: 'n/a',
      notes: 'n/a'
    };
  }

  return jobDetails;
}

module.exports = { scrapeLinkedIn };
