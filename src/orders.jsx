import React, { useState, useEffect } from 'react';
import { Clock, Printer, FileText, CheckCircle, XCircle } from 'lucide-react';
import { db } from './component/firebase'; // Import Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import { jwtDecode } from "jwt-decode";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [userId, setuserId] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          setuserId(decoded.uid);
          

        //   const docRef = doc(db, "Users", userId);
        //   const docSnap = await getDoc(docRef);

        //   if (docSnap.exists()) {
        //     setUserDetails(docSnap.data());
        //   }
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
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'printJobs'); // Firestore collection name
        const q = query(ordersRef, where('userId', '==', userId)); // Get orders for logged-in user
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: new Date(data.createdAt).toLocaleDateString(),
            files: data.files.map(file => file.fileName),
            status: data.status,
            pickupTime: data.files[0]?.settings?.schedule || 'Immediate',
            totalPrice: data.totalAmount,
            details: {
              copies: data.files.reduce((sum, file) => sum + file.settings.copies, 0),
              color: data.files.some(file => file.settings.color === 'color') ? 'color' : 'bw',
              paper: 'standard', // Add logic if you store different paper types
              size: 'a4' // Adjust if you store size separately
            }
          };
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-green-600';
      case 'processing':
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
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <>
      <Nav />
      <div className="max-w-6xl mx-auto p-6 mt-[100px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <button
            onClick={() => window.location.href = '/locate'}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Printer className="h-5 w-5" />
            New Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {orders.length === 0 ? (
            <p className="p-6 text-gray-600">No orders found.</p>
          ) : (
            orders.map((order) => (
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
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Pickup: {order.pickupTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{order.files.length} file(s): {order.files.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-lg font-semibold">₹{order.totalPrice}</div>
                    <div className="text-sm text-gray-600">
                      {order.details.copies} copies • {order.details.color === 'bw' ? 'B&W' : 'Color'} • {order.details.paper}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {order.status === 'processing' && (
                    <button className="text-red-600 text-sm hover:text-red-700">
                      Cancel Order
                    </button>
                  )}
                  <button className="text-blue-600 text-sm hover:text-blue-700">
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
