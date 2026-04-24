const { Queue, Worker, QueueEvents } = require("bullmq");

const Redis = require("ioredis");
const config = require("../config");

const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // Disable automatic retries
});

const crawlQueue = new Queue("crawlQueue", { connection });

const crawlQueueEvents = new QueueEvents("crawlQueue", { connection });

crawlQueueEvents.on("completed", (job) => {
  console.log(`Job completed: ${job.jobId}`);
});

crawlQueueEvents.on("failed", (job) => {
  console.error(`Job failed: ${job.jobId}, Error: ${job.failedReason}`);
});

const addCrawlJob = async (url, multiPage = false) => {
  const job = await crawlQueue.add(
    "crawl",
    { url, multiPage },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 100, // Keep last 100 jobs to show in dashboard
      removeOnFail: 100,
    }
  );
  console.log(`Added job to crawl queue: ${job.id}`);
  return job.id;
};

module.exports = {
  addCrawlJob,
  connection,
  crawlQueue,
};
