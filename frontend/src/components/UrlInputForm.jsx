// frontend/src/components/UrlInputForm.jsx
import { useState } from "react";

function UrlInputForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [multiPage, setMultiPage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && !loading) {
      onSubmit(url, multiPage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-xl space-y-4 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Submit URL for Crawl
      </h2>
      <div>
        <label
          htmlFor="url-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Website URL:
        </label>
        <input
          type="url"
          id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g., https://example.com"
          required
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          disabled={loading}
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="multi-page-checkbox"
          checked={multiPage}
          onChange={(e) => setMultiPage(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label
          htmlFor="multi-page-checkbox"
          className="ml-2 block text-sm text-gray-900"
        >
          Crawl multiple pages (basic, limited depth)
        </label>
      </div>
      <button
        type="submit"
        className={`w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Start Crawl"}
      </button>
    </form>
  );
}

export default UrlInputForm;
