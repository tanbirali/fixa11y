const { PutObjectCommand } = require("@aws-sdk/client-s3");
const puppeteerHtmlPdf = require("puppeteer-html-pdf");
const config = require("../config");

const generateJsonReport = async (s3Client, jobId, scanResults, url) => {
  try {
    const reportData = {
      scanId: jobId,
      scanUrl: url,
      scanDate: new Date().toISOString(),
      issues: scanResults,
    };

    const key = `reports/json/${jobId}.json`;

    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      Body: JSON.stringify(reportData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error generating JSON report:", error);
    throw new Error("Failed to generate JSON report");
  }
};

const generatePdfReport = async (s3Client, jobId, htmlContent) => {
  try {
    const pdf = await puppeteerHtmlPdf.createPdf(htmlContent, { format: "A4" });
    const key = `reports/pdf/${jobId}.pdf`;

    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      Body: pdf,
      ContentType: "application/pdf",
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw new Error("Failed to generate PDF report");
  }
};

module.exports = {
  generateJsonReport,
  generatePdfReport,
};
