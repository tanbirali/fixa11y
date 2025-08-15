const puppeteer = require("puppeteer");

const config = require("../config");

const s3Service = require("./s3Service");

const launchBrowser = async () => {
  return puppeteer.launch({
    headless: config.puppeteer.headless,
    args: config.puppeteer.args,
  });
};

const crawlSinglePage = async (url, jobId) => {
  let browser;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    const domContent = await page.content();
    const s3Url = await s3Service.uploadDomObject(jobId, domContent);
    return s3Url;
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const crawlMultiPage = async (url, jobId) => {
  let browser;
  let snapshots = [];
  const visitedUrls = new Set();
  const urlsToVisit = [url];
  const maxPages = 5;

  try {
    browser = await launchBrowser();
    while (urlsToVisit.length > 0 && visitedUrls.size < maxPages) {
      const currentUrl = urlsToVisit.shift();
      if (visitedUrls.has(currentUrl)) continue;

      visitedUrls.add(currentUrl);
      console.log(`Crawling: ${currentUrl}`);

      const page = await browser.newPage();
      try {
        await page.goto(currentUrl, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });
        const domContent = await page.content();
        const snapshotId = `${jobId}-${visitedUrls.size}`;
        const s3Url = await s3Service.uploadDomObject(snapshotId, domContent);
        snapshots.push(s3Url);

        const links = await page.$$eval("a", (anchors) => {
          return Array.from(anchors, (anchor) => anchor.href);
        });

        for (const link of links) {
          try {
            const { hostname, protocol } = new URL(link);
            if (
              (protocol === "http:" || protocol === "https:") &&
              hostname === new URL(url).hostname
            ) {
              urlsToVisit.push(link.endsWith("/") ? link.slice(0, -1) : link);
            }
          } catch (error) {
            console.error(`Invalid link found: ${link}`);
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error);
        throw error;
      } finally {
        await page.close();
      }
    }
  } catch (error) {
    console.error(`Error crawling multipage starting from ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  crawlSinglePage,
  crawlMultiPage,
};
