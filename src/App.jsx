import React from 'react'
import Login from "./Login"
import Signup from "./signup"
import Home from "./Home"
import FileUploadPage from "./FileUploadPage"
import PrinterLocator from './PrinterLocator'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
const App = () => {
  return (
<>
<Router>
      <div className="app h-screen w-full ">
      
        <Routes >
         
          <Route path="/login" Component={Login} />
          <Route path="/signup" Component={Signup} />
          <Route path="/locate" Component={PrinterLocator} />
          <Route path="/upload" Component={FileUploadPage} />
          <Route path='/' exact Component={Home} />
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
