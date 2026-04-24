function DomViewer({ domContent, loading, error, onClose }) {
  if (!loading && !domContent && !error) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">DOM Snapshot Viewer</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-gray-400 text-lg">Loading DOM snapshot...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-900/50 border border-red-500 text-red-200 rounded-xl">
              <p className="font-bold mb-2 text-red-400">Error retrieving snapshot:</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-gray-300 font-mono text-xs sm:text-sm">
              <pre className="whitespace-pre-wrap break-all bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-inner">
                {domContent}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DomViewer;
