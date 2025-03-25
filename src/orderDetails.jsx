import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Printer, FileText, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { db } from './component/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Nav from "./nav";

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
      <div className="max-w-4xl mx-auto p-6 mt-[100px]">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <div className="text-right">
              <div className="text-lg font-semibold">₹{order.payment?.amount}</div>
              <div className="text-sm text-gray-600">Payment ID: {order.payment?.id}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-sm font-semibold text-blue-600">
                  Status: {order.cancelled_time ? 'Cancelled' :
                          order.completed_time ? 'Ready for pickup' :
                          order.printing_started ? 'Printing in progress' :
                          order.processing_started ? 'Processing order' : 
                          'Order received'}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {order.cancelled_time ? '0%' :
                   order.completed_time ? '100%' :
                   order.printing_started ? '75%' :
                   order.processing_started ? '50%' :
                   '25%'}
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
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
                ></div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="border-l-2 border-gray-200 pl-4 mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold">Order Submitted</div>
                <div className="text-sm text-gray-600">{order.submitted_time}</div>
              </div>
            </div>
            {order.processing_started && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Processing Started</div>
                  <div className="text-sm text-gray-600">{order.processing_started}</div>
                </div>
              </div>
            )}
            {order.printing_started && (
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Printing Started</div>
                  <div className="text-sm text-gray-600">{order.printing_started}</div>
                </div>
              </div>
            )}
            {order.completed_time && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">Completed</div>
                  <div className="text-sm text-gray-600">{order.completed_time}</div>
                </div>
              </div>
            )}
            {order.cancelled_time && (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-semibold">Cancelled</div>
                  <div className="text-sm text-gray-600">{order.cancelled_time}</div>
                </div>
              </div>
            )}
          </div>

          {/* Files Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Files</h2>
            <div className="space-y-3">
              {order.files.map((file, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <div className="font-medium">{file.fileName}</div>
                        <div className="text-sm text-gray-600">
                          {file.pageCount} pages
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{file.price}</div>
                    </div>
                  </div>
                  
                  {/* Detailed Settings Grid */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600">Color Mode</div>
                      <div className="font-medium">
                        {file.settings.color === 'black' ? 'Black & White' : 'Color'}
                      </div>
                    </div>
                    
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600">Paper Size</div>
                      <div className="font-medium">{file.settings.paperSize}</div>
                    </div>
                    
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600">Copies</div>
                      <div className="font-medium">{file.settings.copies}</div>
                    </div>
                    
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600">Orientation</div>
                      <div className="font-medium capitalize">{file.settings.orientation || 'Portrait'}</div>
                    </div>
                    
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600">Sides</div>
                      <div className="font-medium">
                        {file.settings.doubleSided ? 'Double-sided' : 'Single-sided'}
                      </div>
                    </div>
                    
                    {file.settings.pageRange && file.settings.pageRange !== 'all' && (
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-600">Page Range</div>
                        <div className="font-medium">{file.settings.pageRange}</div>
                      </div>
                    )}
                    
                    {file.settings.customRange && (
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-600">Custom Range</div>
                        <div className="font-medium">{file.settings.customRange}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Pickup Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <span className="font-medium">Hub:</span> {order.hubName}
              </div>
              <div>
                <span className="font-medium">Pickup Time:</span>{' '}
                {order.schedule.type === 'immediate' 
                  ? 'Immediate'
                  : `${order.schedule.date} at ${order.schedule.time}`}
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {order.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-red-700">{order.error_message}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
