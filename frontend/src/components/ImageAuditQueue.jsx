import { useState, useEffect } from "react";
import { fetchVisionAudit, updateVisionAudit } from "../api/api";

function ImageAuditQueue({ jobId, onClose }) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadAudit();
    }
  }, [jobId]);

  const loadAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVisionAudit(jobId);
      setAuditData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (index, updates) => {
    const newIssues = [...auditData.issues];
    newIssues[index] = { ...newIssues[index], ...updates };
    setAuditData({ ...auditData, issues: newIssues });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVisionAudit(jobId, auditData.issues);
      alert("Audit results saved successfully!");
    } catch (err) {
      alert("Failed to save audit: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading audit queue...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!auditData || !auditData.issues || auditData.issues.length === 0) {
    return <div className="p-8 text-center">No images found for audit in this job.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Image Alt-Text Audit</h2>
            <p className="text-sm text-gray-500">Job: {jobId} | {auditData.issues.length} images to review</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {auditData.issues.map((item, index) => (
            <div key={index} className={`p-4 rounded-xl border-2 transition-colors ${
              item.status === 'accepted' ? 'border-green-200 bg-green-50' : 
              item.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'
            }`}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <img src={item.src} alt="Preview" className="w-full rounded-lg shadow-sm border border-gray-200 bg-gray-100 object-contain max-h-48" />
                  <p className="mt-2 text-[10px] text-gray-400 break-all">{item.src}</p>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Suggested Alt-Text (GPT-4o Vision)</label>
                    <textarea 
                      value={item.suggestion}
                      onChange={(e) => handleUpdateItem(index, { suggestion: e.target.value, status: 'edited' })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] text-gray-800"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => handleUpdateItem(index, { status: 'accepted' })}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        item.status === 'accepted' ? 'bg-green-600 text-white' : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Accept
                    </button>
                    
                    <button 
                      onClick={() => handleUpdateItem(index, { status: 'rejected' })}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        item.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      Reject
                    </button>

                    <div className="flex-1"></div>
                    
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="mr-2">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">{item.pipeline}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-blue-300 transition transform hover:-translate-y-0.5"
          >
            {saving ? "Saving Changes..." : "Apply All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageAuditQueue;
