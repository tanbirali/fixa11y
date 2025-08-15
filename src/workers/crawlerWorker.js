const { Worker } = require("bullmq");
const { connection } = require("../services/queueService");
const crawlService = require("../services/crawlService");
const s3Service = require("../services/s3Service");

const worker = new Worker(
  "crawlQueue",
  async (job) => {
    const { url, multiPage } = job.data;

    const jobId = job.id;

    console.log(
      `Processing job ${jobId} with URL: ${url} and multiPage: ${multiPage}`
    );
    try {
      let result;
      if (multiPage) {
        result = await crawlService.crawlMultiPage(url, jobId);
      } else {
        result = await crawlService.crawlSinglePage(url, jobId);
      }
      console.log(`Job ${jobId} completed successfully. Result: ${result}`);
      return {
        success: true,
        s3Url: result,
        jobId: jobId,
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
