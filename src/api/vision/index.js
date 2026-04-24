const express = require("express");
const s3Service = require("../../services/s3Service");
const router = express.Router();

// Get audit queue for a specific job
router.get("/audit/:jobId", async (req, res) => {
  const { jobId } = req.params;
  try {
    const report = await s3Service.getJsonReport(`${jobId}-vision`);
    res.json(JSON.parse(report));
  } catch (error) {
    console.error(`Error fetching vision audit for job ${jobId}:`, error);
    res.status(404).json({ error: "Audit data not found for this job" });
  }
});

// Update audit results (Accept/Reject/Edit)
router.post("/audit/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { auditResults } = req.body;
  try {
    await s3Service.updateVisionReport(jobId, auditResults);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating vision audit for job ${jobId}:`, error);
    res.status(500).json({ error: "Failed to update audit data" });
  }
});

module.exports = router;
