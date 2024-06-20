const scrapeJobDetails = require("../utils/jobScraper");

const router = require("express").Router();

// scrape job listing
router.post("/scrape", async (req, res, next) => {
    const url = req.body.url
    console.log('url', url)
    const data = await scrapeJobDetails(url)
    res.json(data)
})

module.exports = router;
