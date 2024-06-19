const scrapeJobDetails = require("../utils/jobScraper");

const router = require("express").Router();

// scrape job listing
router.get("/scrape/:url", async (req, res, next) => {
    const url = req.params.url
    const data = await scrapeJobDetails(url)
    res.json(data)
})

module.exports = router;
