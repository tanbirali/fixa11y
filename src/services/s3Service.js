const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("../config");

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
    console.log(`Successfully uploaded DOM object to S3: ${key}`);
    const signedUrl = await getSignedUrl;
    return signedUrl;
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
  } catch {
    if (error.code === "NoSuchKey") {
      throw new Error(`DOM snapshot not found for key: ${key}`);
    }
    console.error("Error retrieving DOM snapshot:", error);
    throw new Error(`Failed to retrieve DOM snapshot for key: ${key}`);
  }
};

module.exports = {
  s3Client,
  uploadDomObject,
  getDomSnapshot,
};
