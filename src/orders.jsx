import React, { useState, useEffect } from 'react';
import { Clock, Printer, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { db } from './component/firebase'; // Import Firestore instance
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import { jwtDecode } from "jwt-decode";

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
          date: new Date(data.createdAt).toLocaleDateString(),
          files: data.files.map(file => file.fileName),
          status: data.status,
          pickupTime: pickupTime,
          totalPrice: data.totalAmount,
          hubName: data.hubName,
          details: {
            copies: data.files.reduce((sum, file) => sum + (file.settings?.copies || 1), 0),
            color: data.files.some(file => file.settings?.color === 'color') ? 'color' : 'bw',
            paper: 'standard',
            size: 'a4'
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-green-600';
      case 'processing':
      case 'pending':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // Function to safely render any value as string
  const renderSafely = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Add this function after getStatusIcon
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
      <div className="max-w-6xl mx-auto p-6 mt-[100px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <button
            onClick={() => navigate('/locate')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Printer className="h-5 w-5" />
            New Order
          </button>
        </div>

        {/* Add filter buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'cancelled'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelled Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {loading ? (
            <p className="p-6 text-gray-600">Loading your orders...</p>
          ) : getFilteredOrders().length === 0 ? (
            <p className="p-6 text-gray-600">No orders found.</p>
          ) : (
            getFilteredOrders().map((order) => (
              <div
                key={order.id}
                className="border-b last:border-b-0 p-6 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                      <div className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{renderSafely(order.status)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Pickup: {renderSafely(order.pickupTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{order.files.length} file(s): {order.files.join(', ')}</span>
                      </div>
                      {order.hubName && (
                        <div className="text-sm text-gray-600">
                          Hub: {renderSafely(order.hubName)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-lg font-semibold">₹{renderSafely(order.totalPrice)}</div>
                    <div className="text-sm text-gray-600">
                      {renderSafely(order.details.copies)} copies • {order.details.color === 'bw' ? 'B&W' : 'Color'} • {renderSafely(order.details.paper)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {(order.status === 'processing' || order.status === 'pending') && (
                    <button 
                      className="text-red-600 text-sm hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                    >
                      {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  <button 
                    className="text-blue-600 text-sm hover:text-blue-700"
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;