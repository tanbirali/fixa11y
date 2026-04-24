const express = require("express");
const router = express.Router();
const { crawlQueue } = require("../../services/queueService");

router.get("/recent", async (req, res) => {
  try {
    const jobs = await crawlQueue.getJobs(["completed", "failed", "active", "waiting"]);

    // Sort jobs by timestamp descending
    jobs.sort((a, b) => b.timestamp - a.timestamp);

    const recentScans = jobs.map(async job => {
      const returnvalue = job.returnvalue || {};

      return {
        jobId: job.id,
        url: job.data.url,
        status: await job.getState(), // Actually this is async, let's fix it below
        timestamp: job.timestamp,
        finishedOn: job.finishedOn,
        reports: returnvalue.reportsKey || null
      };
    });

    // Actually getState should be awaited individually but it's slow. Since we did getJobs via types, let's just use job properties if we can or map it async.
    const recentScansMapped = await Promise.all(
      jobs.map(async (job) => {
        const returnvalue = job.returnvalue || {};
        return {
          jobId: job.id,
          url: job.data.url,
          status: await job.getState(),
          timestamp: job.timestamp,
          finishedOn: job.finishedOn,
          reports: returnvalue.reportsKey || null
        }
      })
    );

    res.json({ scans: recentScansMapped });
  } catch (error) {
    console.error("Error fetching recent scans:", error);
    res.status(500).json({ error: "Failed to fetch recent scans" });
  }
});

module.exports = router;
