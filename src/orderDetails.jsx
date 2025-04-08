import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Printer, FileText, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { db } from './component/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Nav from "./nav";
import { toast } from 'react-hot-toast';
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(db, 'printJobs', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const data = orderSnap.data();
          setOrder({
            id: orderSnap.id,
            ...data,
            submitted_time: new Date(data.submitted_time).toLocaleString(),
            processing_started: data.processing_started ? new Date(data.processing_started).toLocaleString() : null,
            printing_started: data.printing_started ? new Date(data.printing_started).toLocaleString() : null,
            completed_time: data.completed_time ? new Date(data.completed_time).toLocaleString() : null,
            cancelled_time: data.cancelled_time ? new Date(data.cancelled_time).toLocaleString() : null,
          });
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-50 p-6">Order not found</div>;
  }

  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[100px] pb-8">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-sm text-gray-500 mt-1">Placed on {order.submitted_time}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xl font-semibold text-gray-900">₹{order.payment?.amount}</div>
                <div className="text-sm text-gray-500">Payment ID: {order.payment?.id}</div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="text-sm font-medium text-gray-900">
                  {order.cancelled_time ? (
                    <span className="inline-flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      Cancelled
                    </span>
                  ) : order.completed_time ? (
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Ready for pickup
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-blue-600">
                      <Printer className="h-4 w-4" />
                      {order.printing_started ? 'Printing in progress' : 
                       order.processing_started ? 'Processing order' : 
                       'Order received'}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {order.cancelled_time ? '0%' :
                   order.completed_time ? '100%' :
                   order.printing_started ? '75%' :
                   order.processing_started ? '50%' :
                   '25%'}
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    order.cancelled_time ? 'bg-red-500' :
                    order.completed_time ? 'bg-green-500' : 
                    'bg-blue-500'
                  }`}
                  style={{
                    width: order.cancelled_time ? '0%' :
                           order.completed_time ? '100%' :
                           order.printing_started ? '75%' :
                           order.processing_started ? '50%' :
                           '25%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {/* Timeline items */}
              <div className="flex flex-col space-y-4">
                {[
                  { time: order.submitted_time, label: 'Order Submitted', icon: Clock, color: 'blue' },
                  ...(order.processing_started ? [{ time: order.processing_started, label: 'Processing Started', icon: Clock, color: 'blue' }] : []),
                  ...(order.printing_started ? [{ time: order.printing_started, label: 'Printing Started', icon: Printer, color: 'blue' }] : []),
                  ...(order.completed_time ? [{ time: order.completed_time, label: 'Completed', icon: CheckCircle, color: 'green' }] : []),
                  ...(order.cancelled_time ? [{ time: order.cancelled_time, label: 'Cancelled', icon: XCircle, color: 'red' }] : [])
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                      <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Files</h2>
            <div className="space-y-4">
              {order.files.map((file, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate" title={file.fileName}>
                            {file.fileName.length > 25 
                              ? file.fileName.substring(0, 25) + '...' 
                              : file.fileName}
                          </p>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={() => {
                              // Create a temporary textarea to copy the filename
                              const textarea = document.createElement('textarea');
                              textarea.value = file.fileName;
                              document.body.appendChild(textarea);
                              textarea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textarea);
                              toast.success('Filename copied to clipboard!');
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {file.pageCount} pages
                          </span>
                          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {file.settings?.paperSize}
                          </span>
                          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {file.settings?.color === 'black' ? 'B&W' : 'Color'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">₹{file.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(file.settings).map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {order.error_message && (
            <div className="mx-6 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{order.error_message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
