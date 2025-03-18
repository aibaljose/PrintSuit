import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, orderBy, onSnapshot } from "../component/firebase";
import { FileText, Clock, CheckCircle, AlertTriangle, Printer, RefreshCw } from 'lucide-react';

const PrintJobMonitoring = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Create query for print jobs
    const printJobsRef = collection(db, "print_jobs");
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
      const printJobsRef = collection(db, "print_jobs");
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

  const filteredJobs = filter === 'all' 
    ? printJobs 
    : printJobs.filter(job => job.status === filter);

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Print Jobs Monitor</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <div className="flex gap-2">
            <select 
              className="border rounded-md p-2"
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hub ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{job.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{job.file_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{job.hub_id}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.submitted_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintJobMonitoring;
