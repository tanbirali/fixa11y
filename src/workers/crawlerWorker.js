const { Worker } = require("bullmq");
const { connection } = require("../services/queueService");
const crawlService = require("../services/crawlService");
const s3Service = require("../services/s3Service");
const axeService = require("../services/axeService");
const visionService = require("../services/visionService");
const fs = require("fs");
const worker = new Worker(
  "crawlQueue",
  async (job) => {
    const { url, multiPage } = job.data;

    const jobId = job.id;


    try {
      let domContent;
      let domSnapshotKey;
      let violations;
      let images = [];
      //Step 1: Crawling the page to get the domSnapshot
      if (multiPage) {
        const crawlResults = await crawlService.crawlMultiPage(url, jobId);
        // For simplicity, take the first one or combine. Let's combine images.
        images = crawlResults.flatMap(r => r.images || []);
        domSnapshotKey = crawlResults[0]?.s3Url; // Placeholder for first page
        domContent = crawlResults[0]?.domContent;
      } else {
        const result = await crawlService.crawlSinglePage(url, jobId);
        domContent = result.domContent;
        domSnapshotKey = result.s3Url;
        images = result.images || [];
      }


      if (!domContent) {
        throw new Error(`Failed to retrieve DOM content for job ${jobId}`);
      }
      
      //Step 2: Scanning the axe core scan on the DOM content
      console.log(`Running axe-core scan for ${url} against DOM snapshot`);
      violations = await axeService.scanDom(domContent);
      console.log(`Scan Complete. Found ${violations.length} violations.`);

      // Step 3: Generate and store reports in S3
      console.log("Generating JSON and PDF reports...");
      const jsonKey = await s3Service.generateJsonReport(
        jobId,
        violations,
        url
      );
      // Generate PDF report using a separate template function
      const pdfHtml = s3Service.generatePdfHtmlTemplate(url, violations);
      fs.writeFileSync("report.html", pdfHtml, "utf8");
      const pdfKey = await s3Service.generatePdfReport(jobId, pdfHtml);

      // Step 4: Process images for vision pipeline
      console.log(`Processing ${images.length} images for vision pipeline...`);
      const imageAuditResults = [];
      for (const img of images) {
        try {
          const analysis = await visionService.analyzeImage(img.src);
          if (analysis.isRelevant) {
            imageAuditResults.push({
              ...img,
              suggestion: analysis.suggestion,
              confidence: analysis.confidence,
              status: "pending", // For human review
              pipeline: analysis.pipeline
            });
          }
        } catch (err) {
          console.error(`Failed to analyze image ${img.src}:`, err);
        }
      }

      let visionKey = null;
      if (imageAuditResults.length > 0) {
        visionKey = await s3Service.generateJsonReport(
          `${jobId}-vision`,
          imageAuditResults,
          url
        );
      }


      return {
        success: true,
        domSnapshotKey: domSnapshotKey,
        jobId: jobId,
        reportsKey: {
          json: jsonKey,
          pdf: pdfKey,
          vision: visionKey,
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
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});


