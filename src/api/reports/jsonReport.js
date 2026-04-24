const express = require("express");
const s3Service = require("../../services/s3Service");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const jsonReport = await s3Service.getJsonReport(id);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(jsonReport);
  } catch (error) {
    console.error(`Error fetching json report for job ${id}:`, error);
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
