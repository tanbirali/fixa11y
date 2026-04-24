const express = require("express");

const s3Service = require("../../services/s3Service");

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const pdfReport = await s3Service.getPdfReport(id);
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfReport);
  } catch (error) {
    console.log(`Error fetching pdf report for key ${id}: ${error.message}`);
  }
});

module.exports = router;
