import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Routes, Route } from 'react-router-dom';
import { Home, PrinterIcon, LogOut, Menu } from 'lucide-react';
import StaffDashboard from '../pages/StaffDashboard';
import Staff from '../staff';

const StaffLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white shadow-lg`}>
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <h1 className={`font-bold text-xl text-blue-600 ${!isSidebarOpen && 'hidden'}`}>PrintSuit</h1>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
          </div>
          
          <nav className="flex-1 p-4">
            <NavLink to="/staff" end
              className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
            >
              <Home size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink to="/staff/jobs"
              className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
            >
              <PrinterIcon size={20} />
              {isSidebarOpen && <span>Print Jobs</span>}
            </NavLink>
          </nav>

          <div className="p-4 border-t">
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 w-full">
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Routes>
            <Route index element={<StaffDashboard />} />
            <Route path="jobs" element={<Staff />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
