// frontend/src/pages/HomePage.jsx
import { useState } from "react";
import UrlInputForm from "../components/UrlInputForm";
import DomViewer from "../components/DomViewer";
import { submitCrawlUrl, fetchDomSnapshot } from "../api/api";

function HomePage() {
  const [jobId, setJobId] = useState(null);
  const [domSnapshot, setDomSnapshot] = useState(null);
  const [loadingCrawl, setLoadingCrawl] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [error, setError] = useState(null);

  const handleUrlSubmit = async (url, multiPage) => {
    setLoadingCrawl(true);
    setError(null);
    setJobId(null);
    setDomSnapshot(null); // Clear previous snapshot
    try {
      const result = await submitCrawlUrl(url, multiPage);
      setJobId(result.jobId);
      // Optionally, poll for snapshot or rely on user clicking "Fetch"
      alert(
        `Crawl job submitted! Job ID: ${result.jobId}. Please wait a moment then click "Fetch DOM Snapshot" below.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCrawl(false);
    }
  };

  const handleFetchSnapshot = async () => {
    if (!jobId) {
      setError("No job ID available. Please submit a URL first.");
      return;
    }
    setLoadingSnapshot(true);
    setError(null);
    try {
      const snapshot = await fetchDomSnapshot(jobId);
      setDomSnapshot(snapshot);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSnapshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        🌐 ADA Compliance Crawler
      </h1>

      <div className="w-full max-w-3xl mb-8">
        <UrlInputForm onSubmit={handleUrlSubmit} loading={loadingCrawl} />
      </div>

      {error && (
        <div
          className="w-full max-w-3xl mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md"
          role="alert"
        >
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {jobId && (
        <div className="w-full max-w-3xl mb-8 p-6 bg-white shadow-lg rounded-xl text-center">
          <p className="text-lg text-gray-700 mb-4">
            Crawl Job ID:{" "}
            <span className="font-mono bg-gray-200 px-2 py-1 rounded-md text-sm">
              {jobId}
            </span>
          </p>
          <button
            onClick={handleFetchSnapshot}
            className={`py-2 px-6 rounded-lg shadow-md text-lg font-medium text-white ${
              loadingSnapshot
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
            }`}
            disabled={loadingSnapshot}
          >
            {loadingSnapshot ? "Fetching..." : "Fetch DOM Snapshot"}
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl">
        <DomViewer
          domContent={domSnapshot}
          loading={loadingSnapshot && jobId}
          error={error}
        />
      </div>
    </div>
  );
}

export default HomePage;
