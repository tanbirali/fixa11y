const express = require("express");

const queueService = require("../../services/queueService");

const router = express.Router();

router.post("/", async (req, res) => {
  const { url, multiPage } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const jobId = await queueService.addCrawlJob(url, multiPage);
    res.status(202).json({
      message: "Crawl Job initiated.",
      jobId: jobId,
    });
  } catch (error) {
    console.error("Error adding job to queue:", error);
    res.status(500).json({ error: "Failed to initiate crawl job queue" });
  }
});

module.exports = router;
