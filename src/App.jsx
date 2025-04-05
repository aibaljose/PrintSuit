import React from 'react'
import Login from "./Login"
import Signup from "./Signup"
import Home from "./Home"
import Admin from "./Admin"
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './pages/StaffDashboard';
import Staff from './staff';
// Ensure it exists

// In your router setup
import Printer from './printer';

import FileUploadPage from "./FileUploadPage"
import PrinterLocator from './PrinterLocator'


import paysucess from "./paysucess";
import Payment from './payment';
import Profile from "./profile"
import OrdersPage from './orders'
import Nav from "./nav"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import OrderDetails from './orderDetails';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Router>
        <div className="app h-screen w-full ">
          <Routes >
            <Route path="/login" Component={Login} />
            <Route path="/signup" Component={Signup} />
            <Route path="/signup" Component={Signup} />
            <Route path="/printer" Component={Printer} />
            <Route path="/locate" Component={PrinterLocator} />
            <Route path="/upload" Component={FileUploadPage} />
            <Route path='/' exact Component={Home} />
            <Route path='/admin'  Component={Admin} />
            <Route path='/payment'  Component={Payment} />
            <Route path='/paysucess'  Component={paysucess} />
            <Route path='/profile'  Component={Profile} />
            <Route path='/orders'  Component={OrdersPage} />
            <Route path='/staff'  Component={StaffLayout} />
            <Route path="/order/:orderId" element={<OrderDetails />} />
            <Route path="/staff/*" element={<StaffLayout />} />
          </Routes>
        </div>
      </Router>
      
    </>
  )
}

export default App
