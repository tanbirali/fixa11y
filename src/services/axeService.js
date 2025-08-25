const axe = require("axe-core");

const scanDom = async (domContent) => {
  try {
    const results = await axe.run(domContent);
    return mapViolations(results.violations);
  } catch (error) {
    console.error("Error scanning DOM:", error);
    throw new Error("Failed to scan DOM");
  }
};

const mapViolations = (violations) => {
  return violations.map((violation) => ({
    id: violation.id,
    wcagCriterion: violation.tags.filter((tag) => tag.startsWith("wcag")),
    impact: violation.impact,
    description: violation.description,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      element: node.target.join(" > "),
      html: node.html,
      xpath: node.any[0]?.selector || node.all[0]?.selector,
    })),
  }));
};

module.exports = {
  scanDom,
};
