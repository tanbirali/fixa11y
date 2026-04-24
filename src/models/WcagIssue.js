class WcagIssue {
  constructor({ elementId, target, criterion, severity, description, message, helpUrl }) {
    this.elementId = elementId; // Specific element id or generic node string
    this.target = target;       // CSS Selector list
    this.criterion = criterion; // e.g., 'wcag2a', 'wcag2aa'
    this.severity = severity;   // 'minor', 'moderate', 'serious', 'critical'
    this.description = description;
    this.message = message;
    this.helpUrl = helpUrl;
  }

  static fromAxeViolation(violation) {
    const issues = [];
    if (!violation.nodes || violation.nodes.length === 0) {
      issues.push(new WcagIssue({
        elementId: null,
        target: [],
        criterion: violation.tags.join(', '),
        severity: violation.impact,
        description: violation.description,
        message: violation.help,
        helpUrl: violation.helpUrl
      }));
      return issues;
    }

    for (const node of violation.nodes) {
      issues.push(new WcagIssue({
        elementId: node.html || null,
        target: node.target,
        criterion: violation.tags.find(t => t.startsWith('wcag')) || violation.tags.join(', '),
        severity: node.impact || violation.impact,
        description: violation.description,
        message: node.failureSummary || violation.help,
        helpUrl: violation.helpUrl
      }));
    }
    return issues;
  }
}

module.exports = WcagIssue;
