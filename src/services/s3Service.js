const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("../config");
const puppeteerHtmlPdf = require("puppeteer-html-pdf");


const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const uploadDomObject = async (key, domContent) => {
  const params = {
    Bucket: config.s3.bucketName,
    Key: `dom-snapshot/${key}.html`, // Ensures the key is unique
    Body: domContent,
    ContentType: "text/html",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // We don't really need a signed URL if we're just returning a key or a placeholder, 
    // but if we want one, we should call it correctly. For now, let's just return the key path.
    return `dom-snapshot/${key}.html`;
  } catch (error) {
    console.error(`Error uploading DOM object to S3: ${error.message}`);
    throw new Error(`Failed to upload DOM object to S3`);
  }
};

const getDomSnapshot = async (key) => {
  const params = {
    Bucket: config.s3.bucketName,
    Key: `dom-snapshot/${key}.html`,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    if (error.code === "NoSuchKey") {
      throw new Error(`DOM snapshot not found for key: ${key}`);
    }
    console.error("Error retrieving DOM snapshot:", error);
    throw new Error(`Failed to retrieve DOM snapshot for key: ${key}`);
  }
};

const generateJsonReport = async (jobId, scanResults, url) => {
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

const generatePdfReport = async (jobId, htmlContent) => {
  try {
    const htmlPdf = new puppeteerHtmlPdf();
    const options = {
      format: "A4",
      executablePath: config.puppeteer.executablePath,
    };
    htmlPdf.setOptions(options);
    const key = `reports/pdf/${jobId}.pdf`;
    try {
      const pdfBuffer = await htmlPdf.create(htmlContent);
      const command = new PutObjectCommand({
        Bucket: config.s3.bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      });

      await s3Client.send(command);
      return key;
    } catch (error) {
      console.error(`Error creating puppeteer html pdf: ${error}`);
    } finally {
      await htmlPdf.closeBrowser();
    }
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw new Error("Failed to generate PDF report");
  }
};

const generatePdfHtmlTemplate = (url, violations) => {
  const violationItems = violations
    .map((issue) => {
      const targetsHtml = issue.target && issue.target.length > 0 
        ? `<p>Affected element targets: ${issue.target.join(", ")}</p>` 
        : "";
      
      return `
      <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
        <h3 class="violation">Element: ${issue.elementId ? issue.elementId.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "Global/Unknown"}</h3>
        <p><strong>Criterion:</strong> ${issue.criterion}</p>
        <p><strong>Severity:</strong> <span style="font-weight:bold; color: ${issue.severity === 'critical' ? 'red' : (issue.severity === 'serious' ? 'orange' : 'black')}">${issue.severity}</span></p>
        <p><strong>Description:</strong> ${issue.description}</p>
        <p><strong>Message:</strong> ${issue.message}</p>
        ${targetsHtml}
        <p><strong>Help URL:</strong> <a href="${issue.helpUrl}">${issue.helpUrl}</a></p>
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
        .violation { margin-bottom: 5px; color: #d32f2f; }
      </style>
    </head>
    <body>
      <h1>Axe-Core Report for ${url}</h1>
      ${violationItems}
    </body>
  </html>
  `;
};

const getPdfReport = async (jobId) => {
  const params = {
    Bucket: config.s3.bucketName,
    Key: `reports/pdf/${jobId}.pdf`,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    if (error.code === "NoSuchKey") {
      throw new Error(`PDF report not found for job ID: ${jobId}`);
    }
    console.error("Error retrieving PDF report:", error);
    throw new Error(`Failed to retrieve PDF report for job ID: ${jobId}`);
  }
};

const getJsonReport = async (jobId) => {
  const params = {
    Bucket: config.s3.bucketName,
    Key: `reports/json/${jobId}.json`,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    if (error.code === "NoSuchKey") {
      throw new Error(`JSON report not found for job ID: ${jobId}`);
    }
    console.error("Error retrieving JSON report:", error);
    throw new Error(`Failed to retrieve JSON report for job ID: ${jobId}`);
  }
};

const updateVisionReport = async (jobId, auditResults) => {
  const key = `reports/json/${jobId}-vision.json`;
  try {
    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      Body: JSON.stringify({
        scanId: jobId,
        scanDate: new Date().toISOString(),
        issues: auditResults,
      }, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error updating vision report:", error);
    throw new Error("Failed to update vision report");
  }
};

module.exports = {
  uploadDomObject,
  getDomSnapshot,
  generateJsonReport,
  generatePdfHtmlTemplate,
  generatePdfReport,
  getPdfReport,
  getJsonReport,
  updateVisionReport,
};
