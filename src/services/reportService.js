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

const generatePdfHtmlTemplate = (url, violations) => {
  const violationItems = violations
    .map((violation) => {
      return `
      <div style="margin-bottom: 20px;">
        <h3>Violation: ${violation.id}</h3>
        <p>Description: ${violation.description}</p>
        <p>Impact: ${violation.impact}</p>
        <p>Tags: ${violation.tags.join(", ")}</p>
      </div>
      `;
    })
    .join("");

  return `
  <html>
    <head>
      <title>Axe-Core Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .violation { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Axe-Core Report for ${url}</h1>
      ${violationItems}
    </body>
  </html>
  `;
};

module.exports = {
  generateJsonReport,
  generatePdfReport,
  generatePdfHtmlTemplate,
};
