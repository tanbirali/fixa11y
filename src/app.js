const express = require("express");
const cors = require("cors");
const config = require("./config");
const crawlRoute = require("./api/crawl");
const snapshotRoute = require("./api/snapshot");
const pdfReportRoute = require("./api/reports/pdfReport");
const jsonReportRoute = require("./api/reports/jsonReport");
const visionRoute = require("./api/vision");
const scansRoute = require("./api/scans");

//Initializ the app
const app = express();

//Cors middleware
app.use(cors());

app.use(express.json());

app.use("/api/v1/crawl", crawlRoute);
app.use("/api/v1/snapshot", snapshotRoute);
app.use("/api/v1/reports/pdf", pdfReportRoute);
app.use("/api/v1/reports/json", jsonReportRoute);
app.use("/api/v1/vision", visionRoute);
app.use("/api/v1/scans", scansRoute);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

const PORT = config.port || 8010;
console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
