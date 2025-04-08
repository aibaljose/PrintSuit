import React, { useState, useEffect } from 'react';
import { Clock, Printer, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { db } from './component/firebase'; // Import Firestore instance
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import { jwtDecode } from "jwt-decode";

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'ready':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'processing':
      return (
        <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'failed':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const OrderCard = ({ order, onCancel, cancellingOrder, navigate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-600 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Order #{order.id}</span>
            <span className="text-sm font-medium mt-1">{order.hubName}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            <div className="flex items-center gap-1.5">
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        {/* Files Section */}
        <div className="space-y-2">
          {order.files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-gray-500 flex-shrink-0">({file.pageCount} pages)</span>
            </div>
          ))}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Pickup: {order.pickupTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {order.details.color === 'black' ? 'B&W' : 'Color'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{order.details.paper}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{order.details.copies} copies</span>
          </div>
        </div>

        {/* Progress Bar (if applicable) */}
        {order.progress && order.progress.percentage > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{order.progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${order.progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(order.status === 'processing' || order.status === 'pending') && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={cancellingOrder === order.id}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
            <button
              onClick={() => navigate(`/order/${order.id}`)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Details
            </button>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ₹{order.totalPrice}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [filter, setFilter] = useState('active'); // Changed default from 'all' to 'active'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          setUserId(decoded.uid);
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token"); // Clear invalid token
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const ordersRef = collection(db, 'printJobs');
      const q = query(ordersRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Handle the schedule formatting
        let pickupTime = 'Immediate';
        
        // First check for schedule at the main job level (based on your storage code)
        if (data.schedule) {
          const schedule = data.schedule;
          if (typeof schedule === 'object' && schedule.date && schedule.time) {
            pickupTime = `${schedule.date} at ${schedule.time}`;
          } else if (schedule.type === 'immediate') {
            pickupTime = 'Immediate';
          } else {
            pickupTime = String(schedule);
          }
        }
        // Fallback to file settings if main level schedule isn't available
        else if (data.files[0]?.settings?.schedule) {
          const schedule = data.files[0].settings.schedule;
          if (typeof schedule === 'object' && schedule.date && schedule.time) {
            pickupTime = `${schedule.date} at ${schedule.time}`;
          } else {
            pickupTime = String(schedule);
          }
        }
        
        return {
          id: doc.id,
          date: new Date(data.submitted_time).toLocaleDateString(),
          files: data.files.map(file => ({
            name: file.fileName,
            pageCount: file.pageCount,
            price: file.price,
            settings: file.settings
          })),
          status: data.status,
          progress: data.progress,
          payment: data.payment,
          pickupTime: data.schedule.type === 'immediate' ? 'Immediate' : `${data.schedule.date} at ${data.schedule.time}`,
          totalPrice: data.payment?.amount || "0.00",
          hubName: data.hubName,
          timestamps: {
            submitted: data.submitted_time,
            processing: data.processing_started,
            printing: data.printing_started,
            completed: data.completed_time,
            cancelled: data.cancelled_time,
            error: data.error_time
          },
          errorMessage: data.error_message,
          details: {
            copies: data.files.reduce((sum, file) => sum + (file.settings?.copies || 1), 0),
            color: data.files.some(file => file.settings?.color === 'color') ? 'color' : 'black',
            paper: data.files[0]?.settings?.paperSize || 'A4',
            doubleSided: data.files[0]?.settings?.doubleSided || false
          }
        };
      });

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const cancelOrder = async (orderId) => {
    setCancellingOrder(orderId);
    setCancelError(null);
    setCancelSuccess(null);
    
    try {
      const orderRef = doc(db, 'printJobs', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      
      setCancelSuccess(`Order #${orderId} has been cancelled successfully.`);
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancelError('Failed to cancel order. Please try again or contact support.');
    } finally {
      setCancellingOrder(null);
    }
  };

  // Function to safely render any value as string
  const renderSafely = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getFilteredOrders = () => {
    switch (filter) {
      case 'active':
        return orders.filter(order => 
          order.status === 'processing' || 
          order.status === 'pending' || 
          order.status === 'ready'
        );
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  return (
    <>
      <Nav />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-[100px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <button
            onClick={() => navigate('/locate')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Printer className="h-5 w-5" />
            New Order
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'active', 'cancelled'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} Orders
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : getFilteredOrders().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredOrders().map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={cancelOrder}
                cancellingOrder={cancellingOrder}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;