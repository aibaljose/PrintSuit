import React, { useEffect, useState } from 'react';
import { Check, Printer, Download, Calendar, ChevronRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './component/firebase'; // Update this import to match your Firebase config path
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [showTick, setShowTick] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  // Extract jobId from location state
  const { jobid } = location.state || {};

  useEffect(() => {
    // Set the tick animation
    setShowTick(true);
    
    // Fetch job details from Firebase using jobid
    const fetchJobDetails = async () => {
      try {
        if (!jobid) {
          throw new Error("Job ID is missing");
        }
        
        // Reference to the document in Firestore
        const jobDocRef = doc(db, "printJobs", jobid);
        const jobSnapshot = await getDoc(jobDocRef);
        
        if (!jobSnapshot.exists()) {
          throw new Error("Print job not found");
        }
        
        const jobData = jobSnapshot.data();
        
        // Transform the database data to match the format needed for display
        const formattedOrderDetails = {
          orderId: jobData.orderId || jobid,
          amount: (jobData.totalAmount), // Assuming amount is stored in cents
          date: new Date(jobData.createdAt).toLocaleDateString(),
          time: new Date(jobData.createdAt).toLocaleTimeString(),
          files: jobData.files.map(file => ({
            name: file.fileName,
            pages: file.pageCount,
            copies: file.settings.copies,
            color: file.settings.color !== "black"
          })),
          printHub: jobData.hubName,
          estimatedReadyTime: getEstimatedReadyTime(jobData)
        };
        
        setOrderDetails(formattedOrderDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobid]);
  
  // Helper function to determine the estimated ready time
  const getEstimatedReadyTime = (jobData) => {
    // Check if any file has a scheduled time
    const hasScheduledFile = jobData.files.some(file => file.settings.schedule !== "immediate");
    
    if (hasScheduledFile) {
      // Find the scheduled file with the latest time
      const scheduledFiles = jobData.files.filter(file => file.settings.schedule !== "immediate");
      return scheduledFiles[0].settings.schedule; // Return the scheduled time
    } else {
      // For immediate printing, estimate 30 minutes from now
      const readyTime = new Date(new Date().getTime() + 30 * 60000);
      return readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto ${
              showTick ? 'scale-100' : 'scale-0'
            } transition-transform duration-500`}>
              <Check className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your print order has been confirmed</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="text-lg font-semibold text-gray-900">{orderDetails.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-lg font-semibold text-green-600">₹{orderDetails.amount}</p>
              </div>
            </div>
          </div>

          {/* Print Details */}
          <div className="p-6 space-y-6">
            {/* Printing Location */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Printer className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Print Location</h3>
                <p className="text-gray-600">{orderDetails.printHub}</p>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ready for Pickup</h3>
                <p className="text-gray-600">{orderDetails.estimatedReadyTime}</p>
              </div>
            </div>

            {/* Files List */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Files to Print</h3>
              <div className="space-y-3">
                {orderDetails.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {file.pages} pages • {file.copies} {file.copies > 1 ? 'copies' : 'copy'} • 
                          {file.color ? ' Color' : ' B&W'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-4" >
              <div onClick={()=>navigate("/orders")} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Printer className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900"  >Track Print Status</p>
                    <p className="text-sm text-gray-600">Check your print job status</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <a href={`/receipts/${jobid}`} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Download Receipt</p>
                    <p className="text-sm text-gray-600">Get your payment receipt</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">Have questions about your order?</p>
          <a href="/support" className="text-blue-600 font-medium hover:text-blue-800">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

const FileText = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default PaymentSuccess;