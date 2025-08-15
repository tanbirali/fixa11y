const express = require("express");
const cors = require("cors");
const config = require("./config");
const crawlRoute = require("./api/crawl");
const snapshotRoute = require("./api/snapshot");

//Initializ the app
const app = express();

//Cors middleware
app.use(cors());

app.use(express.json());

app.use("/api/v1/crawl", crawlRoute);
app.use("/api/v1/snapshot", snapshotRoute);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

const PORT = config.port || 8010;
console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
