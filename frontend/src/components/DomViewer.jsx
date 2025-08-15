// frontend/src/components/DomViewer.jsx

function DomViewer({ domContent, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg shadow-inner">
        <p className="text-gray-600 text-lg">Loading DOM snapshot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-inner">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!domContent) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg shadow-inner">
        <p className="text-gray-600 text-lg">
          Submit a URL to view its DOM snapshot.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg overflow-auto max-h-[70vh] min-h-[300px] font-mono text-sm">
      <h3 className="text-xl font-semibold mb-3 border-b border-gray-600 pb-2">
        Raw DOM Snapshot
      </h3>
      <pre className="whitespace-pre-wrap break-words">{domContent}</pre>
    </div>
  );
}

export default DomViewer;
