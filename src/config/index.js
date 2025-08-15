require("dotenv").config();

module.exports = {
  port: process.env.PORT || 8010,
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "ap-south-1",
    bucketName: process.env.S3_BUCKET_NAME,
  },
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS === "false" ? false : "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
};
