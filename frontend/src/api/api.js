const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8010/api/v1";

export const submitCrawlUrl = async (url, multiPage) => {
  const response = await fetch(`${API_BASE_URL}/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, multiPage }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit crawl job");
  }
  return response.json();
};

export const fetchDomSnapshot = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/snapshot/${jobId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch DOM snapshot");
  }
  return response.text(); // Return raw text for HTML
};

export const fetchRecentScans = async () => {
  const response = await fetch(`${API_BASE_URL}/scans/recent`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch recent scans");
  }
  return response.json();
};

export const fetchVisionAudit = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/vision/audit/${jobId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch vision audit");
  }
  return response.json();
};

export const updateVisionAudit = async (jobId, auditResults) => {
  const response = await fetch(`${API_BASE_URL}/vision/audit/${jobId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auditResults }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update vision audit");
  }
  return response.json();
};
