const express = require("express");

const s3Service = require("../../services/s3Service");

const router = express.Router();

router.get("/:jobId", async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const domContent = await s3Service.getDomSnapshot(jobId);
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(domContent);
  } catch (error) {
    console.error("Error fetching snapshot content:", error);
    if (error.message.includes("No such key")) {
      return res.status(404).json({
        error:
          "DOM snapshot not found. It might still be processing or failed.",
      });
    }
    res.status(500).send("Failed to retrieve snapshot content");
  }
});

module.exports = router;
