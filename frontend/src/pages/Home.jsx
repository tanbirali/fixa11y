import { useState } from "react";
import UrlInputForm from "../components/UrlInputForm";
import DomViewer from "../components/DomViewer";
import ScanList from "../components/ScanList";
import ImageAuditQueue from "../components/ImageAuditQueue";
import { submitCrawlUrl, fetchDomSnapshot } from "../api/api";

function HomePage() {
  const [jobId, setJobId] = useState(null);
  const [domSnapshot, setDomSnapshot] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCrawl(false);
    }
  };

  const handleSelectJob = async (id, audit = false) => {
    if (audit) {
      setJobId(id);
      setShowAudit(true);
      return;
    }

    const targetId = id || jobId;
    if (!targetId) {
      setError("No job ID available.");
      return;
    }

    if (id) {
      setJobId(id);
    }

    setLoadingSnapshot(true);
    setError(null);
    setDomSnapshot(null);
    try {
      const snapshot = await fetchDomSnapshot(targetId);
      setDomSnapshot(snapshot);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSnapshot(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-gray-900 p-6  mb-10 text-center">
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



      <div className="w-full max-w-3xl">
        <ScanList onSelectJob={handleSelectJob} />
      </div>

      <DomViewer
        domContent={domSnapshot}
        loading={loadingSnapshot}
        error={error}
        onClose={() => {
          setDomSnapshot(null);
          setLoadingSnapshot(false);
          setError(null);
        }}
      />

      {showAudit && (
        <ImageAuditQueue
          jobId={jobId}
          onClose={() => setShowAudit(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
