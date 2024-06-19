async function scrapeLinkedIn(page) {
    
    return await page.evaluate(() => {

        const getText = (selector) => {
            const element = document.querySelector(selector);
            return element ? element.innerText.trim() : 'n/a';
        };

        const getPayScale = () => {
            const payElement = document.querySelector('.salary');
            if (payElement) {
                const payText = payElement.innerText.trim();
                const payScaleMatch = payText.match(/(\$\d+K?-\$\d+K?)|(\$\d+K?)/);
                if (payScaleMatch) {
                return payScaleMatch[0];
                }
            }
            return 'n/a';
        };

        const jobTypeMatch = document.body.innerText.match(/(Full-time|Part-time|Contract)/i);
        const jobType = jobTypeMatch ? jobTypeMatch[0] : 'n/a';

        const remoteMatch = document.body.innerText.match(/(Remote)/i);
        const remote = remoteMatch ? 'yes' : 'no';

        const location = getText('.topcard__flavor--bullet');
        let city = 'Remote';
        let state = 'NA';

        // Parse location into city and state
        if (location.includes(',')) {
            const parts = location.split(',').map(part => part.trim());
            city = parts[0];
            state = parts[1];
        } else if (location.toLowerCase().includes('united states')) {
            state = 'Remote'
        }

        // Extract and clean up notes
        let notes = getText('.description__text');
        const showMoreRegex = /Show more$/;
        if (showMoreRegex.test(notes)) {
            notes = notes.replace(showMoreRegex, '').trim();
        }

        return {
            companyName: getText('.topcard__org-name-link'),
            jobTitle: getText('h1'),
            city,
            state,
            jobType,
            remote,
            jobSite: 'LinkedIn',
            payType: document.querySelector('.salary') ? 'salary' : 'n/a',
            payScale: getPayScale(),
            payAmount: getPayScale(),
            notes,
        };
    });
};

module.exports = { scrapeLinkedIn };
