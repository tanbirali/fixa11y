const { Worker } = require("bullmq");
const { connection } = require("../services/queueService");
const crawlService = require("../services/crawlService");
const s3Service = require("../services/s3Service");
const axeService = require("../services/axeService");
const {
  generateJsonReport,
  generatePdfReport,
} = require("../services/reportService");

const worker = new Worker(
  "crawlQueue",
  async (job) => {
    const { url, multiPage } = job.data;

    const jobId = job.id;

    console.log(
      `Processing job ${jobId} with URL: ${url} and multiPage: ${multiPage}`
    );
    try {
      let domContent;
      let domSnapshotKey;
      //Step 1: Crawling the page to get the domSnapshot
      if (multiPage) {
        domContent = await crawlService.crawlPageAndReturnDom(url);
        domSnapshotKey = await crawlService.crawlMultiPage(url, jobId);
      } else {
        domContent = await crawlService.crawlPageAndReturnDom(url);
        domSnapshotKey = await crawlService.crawlSinglePage(url, jobId);
      }
      console.log(
        `Job ${jobId} completed successfully. Result: ${domSnapshotKey}`
      );

      if (!domContent) {
        throw new Error(`Failed to retrieve DOM content for job ${jobId}`);
      }
      //Step 2: Scanning the axe core scan on the DOM content
      console.log(`Running axe-core scan for ${url}`);
      const axeViolations = await axeService.scanDom(domContent);
      console.log(`Scan Complete. Found ${axeViolations.length} violations.`);

      // Step 3: Generate and store reports in S3
      console.log("Generating JSON and PDF reports...");
      const jsonKey = await generateJsonReport(
        s3Service.s3Client,
        jobId,
        axeViolations,
        url
      );
      const pdfKey = await generatePdfReport(
        s3Service.s3Client,
        jobId,
        `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Accessibility Report for ${url}</title>
                <style>/* Add your CSS here */</style>
            </head>
            <body>
                <h1>Accessibility Scan Report</h1>
                <p><strong>URL:</strong> ${url}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <h2>Issues Found (${axeViolations.length})</h2>
                ${axeViolations
                  .map(
                    (issue) => `
                    <div class="issue">
                        <h3>${issue.description}</h3>
                        <p><strong>Impact:</strong> ${issue.impact}</p>
                        <p><strong>WCAG:</strong> ${issue.wcagCriterion.join(
                          ", "
                        )}</p>
                        <pre>${JSON.stringify(issue.nodes, null, 2)}</pre>
                    </div>
                `
                  )
                  .join("")}
            </body>
            </html>
        `
      );
      console.log("Reports generated successfully.");

      return {
        success: true,
        domSnapshotKey: domSnapshotKey,
        jobId: jobId,
        reportsKey: {
          json: jsonKey,
          pdf: pdfKey,
        },
      };
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error);
      throw new Error(`Failed to process job ${jobId}: ${error.message}`);
    }
  },
  {
    connection,
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.jobId} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.jobId} failed with error: ${err.message}`);
});

console.log("Worker started");
