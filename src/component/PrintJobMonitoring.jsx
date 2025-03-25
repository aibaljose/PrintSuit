import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, orderBy, onSnapshot } from "../component/firebase";
import { FileText, Clock, CheckCircle, AlertTriangle, Printer, RefreshCw, ChevronDown, Settings, DollarSign, Calendar } from 'lucide-react';

const PrintJobMonitoring = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedFileIndices, setSelectedFileIndices] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});

  useEffect(() => {
    // Create query for print jobs
    const printJobsRef = collection(db, "printJobs");
    const q = query(printJobsRef, orderBy("submitted_time", "desc"));

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrintJobs(jobs);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        setError("Failed to update print jobs");
        console.error("Error in real-time update:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setError("Failed to listen to print jobs updates");
      console.error("Snapshot listener error:", error);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const fetchPrintJobs = async () => {
    try {
      const printJobsRef = collection(db, "printJobs");
      const q = query(printJobsRef, orderBy("submitted_time", "desc"));
      const querySnapshot = await getDocs(q);
      
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPrintJobs(jobs);
    } catch (err) {
      setError("Failed to fetch print jobs");
      console.error("Error fetching print jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'processing': return <Printer size={16} className="text-blue-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'failed': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const toggleDetails = (jobId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const toggleFiles = (jobId) => {
    setExpandedFiles(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const filteredJobs = filter === 'all' 
    ? printJobs 
    : printJobs.filter(job => job.status === filter);

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mx-auto w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Print Jobs Monitor
        </h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full lg:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors flex-grow md:flex-grow-0"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Jobs</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button 
              onClick={fetchPrintJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden md:inline">{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]"> {/* Add minimum width container */}
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hub</th>
                <th className="w-2/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="w-4/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => {
                const selectedFileIndex = selectedFileIndices[job.id] || 0;
                const selectedFile = job.files?.[selectedFileIndex] || {};
                const isDetailsExpanded = expandedDetails[job.id];
                const isFilesExpanded = expandedFiles[job.id];
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{job.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="relative">
                        <button
                          onClick={() => toggleFiles(job.id)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={16} />
                            <span className="truncate">
                              {job.files?.[selectedFileIndex]?.fileName || 'No file'}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${
                              isFilesExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isFilesExpanded && job.files && job.files.length > 0 && (
                          <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            {job.files.map((file, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedFileIndices({
                                    ...selectedFileIndices,
                                    [job.id]: index
                                  });
                                  toggleFiles(job.id);
                                }}
                                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 ${
                                  selectedFileIndex === index ? 'bg-blue-50 text-blue-700' : ''
                                }`}
                              >
                                <FileText size={14} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{file.fileName}</div>
                                  <div className="text-xs text-gray-500">{file.pageCount} pages</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{job.hubName}</div>
                        <div className="text-gray-500">ID: {job.hubId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.progress && (
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{job.progress.current_page}/{job.progress.total_pages} pages</span>
                            <span>{job.progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 rounded-full h-2" 
                              style={{ width: `${job.progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleDetails(job.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full"
                      >
                        <Settings size={16} />
                        <span className="flex-1">View Details</span>
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${
                            isDetailsExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isDetailsExpanded && (
                        <div className="mt-2 space-y-3 bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2">
                            <Settings size={14} className="text-gray-500" />
                            <div className="text-sm">
                              <div className="font-medium">Print Settings</div>
                              <div className="text-gray-500">
                                {selectedFile.settings?.paperSize}, {selectedFile.settings?.color}
                                {selectedFile.settings?.copies > 1 && `, ${selectedFile.settings?.copies} copies`}
                                {selectedFile.settings?.doubleSided && ', double-sided'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-gray-500" />
                            <div className="text-sm">
                              <div className="font-medium">Price</div>
                              <div className="text-gray-500">₹{selectedFile.price}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <div className="text-sm">
                              <div className="font-medium">Submitted</div>
                              <div className="text-gray-500">
                                {new Date(job.submitted_time).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {filteredJobs.map((job) => {
          const selectedFileIndex = selectedFileIndices[job.id] || 0;
          const selectedFile = job.files?.[selectedFileIndex] || {};
          
          return (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Job ID: {job.id}</div>
                  <div className="font-medium">{job.hubName}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {getStatusIcon(job.status)}
                  <span className="ml-1">{job.status}</span>
                </span>
              </div>

              {job.files && job.files.length > 0 && (
                <div className="mb-4">
                  <select
                    className="w-full border rounded-lg p-2 bg-gray-50 text-sm"
                    value={selectedFileIndex}
                    onChange={(e) => setSelectedFileIndices({
                      ...selectedFileIndices,
                      [job.id]: parseInt(e.target.value)
                    })}
                  >
                    {job.files.map((file, index) => (
                      <option key={index} value={index}>
                        {file.fileName} ({file.pageCount} pages)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {job.progress && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{job.progress.current_page}/{job.progress.total_pages} pages</span>
                    <span>{job.progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${job.progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Settings:</span>
                  <div className="text-gray-500">
                    {selectedFile.settings?.paperSize}, {selectedFile.settings?.color}
                    <br />
                    {selectedFile.settings?.copies || 1} copies,
                    {selectedFile.settings?.doubleSided ? ' double-sided' : ' single-sided'}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Price:</span>
                    <span className="text-gray-500 ml-2">₹{selectedFile.price}</span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(job.submitted_time).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #ddd #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cdcdcd;
        }
      `}</style>
    </div>
  );
};

export default PrintJobMonitoring;
