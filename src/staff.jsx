import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './component/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { FileText, Clock, CheckCircle, AlertTriangle, Printer, RefreshCw, ChevronDown, Settings, DollarSign, ArrowUpDown } from 'lucide-react';

const Staff = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [hubId, setHubId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFileIndices, setSelectedFileIndices] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [sortBy, setSortBy] = useState('newest'); // Add this new state
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue", { position: "top-center" });
        navigate("/");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setUserDetails(decoded);
        console.log("Decoded token:", decoded); // Debug log

        if (!decoded.role || decoded.role !== 'staff') {
          toast.error("You are not authorized to access this page", { position: "top-center" });
          navigate('/');
          return;
        }

        // Fetch user data from Users collection
        const userDoc = await getDoc(doc(db, 'Users', decoded.uid));
        if (!userDoc.exists()) {
          toast.error("User data not found", { position: "top-center" });
          return;
        }

        const userData = userDoc.data();
        if (!userData.hubId) {
          toast.error("No hub assigned to staff", { position: "top-center" });
          return;
        }

        // Fetch print jobs for staff's hub using hubId from user document
        const jobsRef = collection(db, 'printJobs');
        console.log("Fetching jobs for hubId:", userData.hubId); // Debug log
        const jobsQuery = query(jobsRef, where('hubId', '==', userData.hubId));
        const jobsSnapshot = await getDocs(jobsQuery);
        
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrintJobs(jobs);
        setHubId(userData.hubId);
        setLoading(false);

      } catch (error) {
        console.error("Error:", error); // Better error logging
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again", { position: "top-center" });
        navigate("/");
      }
    };

    checkUserAndFetchData();
  }, [navigate]);

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

  const toggleFiles = (jobId) => {
    setExpandedFiles(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const getSortedJobs = () => {
    return [...printJobs].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submitted_time) - new Date(a.submitted_time);
        case 'oldest':
          return new Date(a.submitted_time) - new Date(b.submitted_time);
        case 'completed':
          return (b.status === 'completed') - (a.status === 'completed');
        case 'pending':
          return (b.status === 'pending') - (a.status === 'pending');
        default:
          return 0;
      }
    });
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mx-auto w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Print Jobs
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="completed">Completed First</option>
            <option value="pending">Pending First</option>
          </select>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedJobs().map((job) => {
          const selectedFileIndex = selectedFileIndices[job.id] || 0;
          const selectedFile = job.files?.[selectedFileIndex] || {};
          
          const getBorderColor = () => {
            if (job.status === 'completed') return 'border-green-400';
            if (job.status === 'failed') return 'border-red-400';
            return 'border-gray-200';
          };
          
          return (
            <div key={job.id} className={`bg-white rounded-xl border-[2px] ${getBorderColor()} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-500">Job ID: {job.id}</div>
                    <div className="font-medium text-gray-900 mt-1">{job.customerName}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span>{job.status}</span>
                  </span>
                </div>
                
                {/* File selector */}
                <div className="mt-3">
                  <button
                    onClick={() => toggleFiles(job.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} />
                      <span className="truncate">{job.files?.[selectedFileIndex]?.fileName || 'No file'}</span>
                    </div>
                    <ChevronDown size={16} className={`transform transition-transform ${expandedFiles[job.id] ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Progress section */}
              {job.progress && job.status !== 'completed' && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">{job.progress.current_page}/{job.progress.total_pages} pages</span>
                    <span className="font-medium text-blue-600">{job.progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 rounded-full h-full transition-all duration-300 ease-in-out"
                      style={{ width: `${job.progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Details section */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Settings size={16} className="text-gray-500 mt-1" />
                    <div className="text-sm">
                      <div className="font-medium">Print Settings</div>
                      <div className="text-gray-500">
                        {selectedFile.settings?.paperSize}, {selectedFile.settings?.color}
                        {selectedFile.settings?.copies > 1 && `, ${selectedFile.settings?.copies} copies`}
                        {selectedFile.settings?.doubleSided && ', double-sided'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-500" />
                      <span className="font-medium">₹{selectedFile.price}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(job.submitted_time).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File selection dropdown popup */}
      {Object.entries(expandedFiles).map(([jobId, isExpanded]) => {
        if (!isExpanded) return null;
        const job = printJobs.find(j => j.id === jobId);
        if (!job?.files) return null;

        return (
          <div 
            key={jobId}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
            onClick={() => toggleFiles(jobId)}
          >
            <div 
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto m-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium">Select File</h3>
              </div>
              <div className="p-2">
                {job.files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedFileIndices(prev => ({...prev, [jobId]: index}));
                      toggleFiles(jobId);
                    }}
                    className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 flex items-start gap-3 rounded-lg ${
                      selectedFileIndices[jobId] === index ? 'bg-blue-50/50 text-blue-700 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <FileText size={16} className="mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.fileName}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{file.pageCount} pages</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{file.settings?.paperSize}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">₹{file.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Staff;
