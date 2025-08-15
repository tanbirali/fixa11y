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
