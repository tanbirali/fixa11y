const puppeteer = require("puppeteer");
const { default: AxePuppeteer } = require("@axe-core/puppeteer");
const config = require("../config");
const WcagIssue = require("../models/WcagIssue");

const scanDom = async (domContent) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: config.puppeteer.headless,
      args: config.puppeteer.args,
      executablePath: config.puppeteer.executablePath || "C:\\Users\\TANBIR ALI\\.cache\\puppeteer\\chrome\\win64-138.0.7204.168\\chrome-win64\\chrome.exe",
    });

    const page = await browser.newPage();
    // Load the DOM snapshot explicitly
    await page.setContent(domContent, { waitUntil: "networkidle0" });

    // Run axe against the loaded snapshot
    const results = await new AxePuppeteer(page).analyze();
    
    // Map violations to WcagIssue models
    const wcagIssues = [];
    if (results.violations) {
      for (const violation of results.violations) {
        wcagIssues.push(...WcagIssue.fromAxeViolation(violation));
      }
    }
    
    return wcagIssues;
  } catch (error) {
    console.error("Error scanning DOM with axe-core:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  scanDom,
};
