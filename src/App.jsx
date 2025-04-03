import React from 'react'
import Login from "./Login"
import Signup from "./Signup"
import Home from "./Home"
import Admin from "./Admin"
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './pages/StaffDashboard';
import Staff from './staff';

// In your router setup
import Printer from './printer';

import FileUploadPage from "./FileUploadPage"
import PrinterLocator from './PrinterLocator'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import paysucess from "./paysucess";
import Payment from './payment';
import Profile from "./profile"
import OrdersPage from './orders'
import Nav from "./nav"
import ConnectionConstellation from "./test2"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import OrderDetails from './orderDetails';

const App = () => {
  return (
<>
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
          <Route path='/test'  Component={ConnectionConstellation} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/staff/*" element={<StaffLayout />} />



          {/* <Route path="/register"  element={<Form />} />
          <Route path="/ticket"  Component={Ticket} />
          <Route path="/dashboard"  Component={Dashboard} /> */}
        </Routes>

      </div>
    </Router>
    <ToastContainer />
</>
    

  )
}

export default App
