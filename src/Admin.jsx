import React, { useState, useEffect } from 'react';
import {
  BarChart2, Printer, AlertCircle, Users, Activity,
  Settings, RefreshCw, Plus, X, MapPin, Power,
  Clock, Trash2, Menu
} from 'lucide-react';
import { db, collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc } from "./component/firebase";
import { query, where, setDoc } from "firebase/firestore";
import { FirebaseError } from 'firebase/app';
import UserManagement from './component/UserManagement';
import AdminLoginModal from './component/AdminLoginModal';
import PrintJobMonitoring from './component/PrintJobMonitoring';

const PrinterHubModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading, error, editingHub }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingHub ? 'Edit Printer Hub' : 'Add New Printer Hub'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Hub ID"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Hub Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="Color">Color</option>
              <option value="Monochrome">Monochrome</option>
            </select>
            <select
              value={formData.paperSize}
              onChange={(e) => setFormData({ ...formData, paperSize: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A5">A5</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Print Speed (ppm)"
            value={formData.speed}
            onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Latitude"
              value={formData.location[0]}
              onChange={(e) => setFormData({
                ...formData,
                location: [parseFloat(e.target.value), formData.location[1]]
              })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={formData.location[1]}
              onChange={(e) => setFormData({
                ...formData,
                location: [formData.location[0], parseFloat(e.target.value)]
              })}
              className="w-full p-2 border rounded"
            />
          </div>
          <input
            type="text"
            placeholder="Hub Rating"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingHub ? 'Update Hub' : 'Add Hub')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageHubModal = ({ isOpen, onClose, hub, onStatusUpdate, onDelete, loading, error }) => {
  if (!isOpen || !hub) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Printer Hub: {hub.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Hub Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {hub.id}</p>
              <p><span className="font-medium">Location:</span> {hub.address}</p>
              <p><span className="font-medium">Type:</span> {hub.type}</p>
              <p><span className="font-medium">Paper Size:</span> {hub.paperSize}</p>
              <p><span className="font-medium">Speed:</span> {hub.speed}</p>
              <p>
                <span className="font-medium">Current Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-sm
                  ${hub.status === 'Active' ? 'bg-green-100 text-green-800' :
                    hub.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                  {hub.status}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onStatusUpdate(hub.id, 'Active')}
                className="w-full flex items-center justify-center p-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                <Power size={18} className="mr-2" /> Set Active
              </button>
              <button
                onClick={() => onStatusUpdate(hub.id, 'Maintenance')}
                className="w-full flex items-center justify-center p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                disabled={loading}
              >
                Set Maintenance
              </button>
              <button
                onClick={() => onStatusUpdate(hub.id, 'Idle')}
                className="w-full flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                <Clock size={18} className="mr-2" /> Set Idle
              </button>
              <button
                onClick={() => onDelete(hub.id)}
                className="w-full flex items-center justify-center p-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={loading}
              >
                <Trash2 size={18} className="mr-2" /> Delete Hub
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const PrinterHubCard = ({ hub, onEdit, onManage }) => (
  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl transition-shadow">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">{hub.name}</h3>
      <span className={`px-3 py-1 rounded-full text-sm 
        ${hub.status === 'Active' ? 'bg-green-100 text-green-800' :
          hub.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'}`}>
        {hub.status}
      </span>
    </div>

    <div className="space-y-2">
      <p className="flex items-center text-sm">
        <MapPin size={16} className="mr-2 text-gray-500" />
        {hub.location[1]}, {hub.location[0]}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <p>Type: {hub.type}</p>
        <p>Paper Size: {hub.paperSize}</p>
        <p>Speed: {hub.speed}</p>
        <p>Rating: {hub.rating}/5</p>
      </div>
    </div>

    <div className="mt-4 flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
      <button
        onClick={() => onEdit(hub)}
        className="text-blue-600 hover:underline w-full sm:w-auto text-center"
      >
        Edit Details
      </button>
      <button
        onClick={() => onManage(hub)}
        className="text-blue-600 hover:underline w-full sm:w-auto text-center"
      >
        Manage Hub
      </button>
    </div>
  </div>
);

const PrintSuitAdminDashboard = () => {

  const [activePage, setActivePage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [printerHubs, setPrinterHubs] = useState([]);
  const [editingHub, setEditingHub] = useState(null);
  const [managingHub, setManagingHub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);

  const [formData, setFormData] = useState({
    id: "",
    name: '',
    address: '',
    type: 'Color',
    paperSize: 'A4',
    speed: '30 ppm',
    location: [0, 0],
    rating: "",
    status: 'Active'
  });

  const printerStats = [
    { name: 'Total Printers', value: printerHubs.length, icon: <Printer className="text-blue-500" /> },
    { name: 'Idle Printers', value: printerHubs.filter(hub => hub.status === 'Idle').length, icon: <AlertCircle className="text-yellow-500" /> },
    { name: 'Active Jobs', value: 42, icon: <Activity className="text-green-500" /> },
    { name: 'Carbon Credits', value: 1205, icon: <BarChart2 className="text-teal-500" /> }
  ];

  const recentErrors = [
    { code: 'ERR_PAPER_JAM', printer: 'Station 3', time: '2m ago' },
    { code: 'ERR_LOW_INK', printer: 'Station 7', time: '15m ago' },
    { code: 'ERR_CONNECTIVITY', printer: 'Station 1', time: '45m ago' }
  ];

  useEffect(() => {
    fetchPrinterHubs();
  }, []);

  const fetchPrinterHubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "printerhubs"));
      const printersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()

      }));

      setPrinterHubs(printersData);
    } catch (err) {
      setError("Failed to fetch printer hubs");
      console.error("Error fetching printers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hub) => {
    if (hub) {
      setEditingHub(hub);
      setFormData({
        id: hub.id || "",
        name: hub.name || '',
        address: hub.address || '',
        type: hub.type || 'Color',
        paperSize: hub.paperSize || 'A4',
        speed: hub.speed || '30 ppm',
        location: hub.location || [0, 0],
        rating: hub.rating || "5",
        status: hub.status || 'Active'
      });
    } else {
      setEditingHub(null);
      setFormData({
        id: "",
        name: '',
        address: '',
        type: 'Color',
        paperSize: 'A4',
        speed: '30 ppm',
        location: [0, 0],
        rating: "5",
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleManageHub = (hub) => {
    setManagingHub(hub);
    setIsManageModalOpen(true);
  };

  const handleDeleteHub = async (hubid) => {
    if (!window.confirm('Are you sure you want to delete this printer hub?')) return;
    console.log(hubid);

    setLoading(true);
    try {
      await deleteDoc(doc(db, "printerhubs", hubid));
      await fetchPrinterHubs();
      setIsManageModalOpen(false);
    } catch (err) {
      setError("Failed to delete printer hub");
      console.error("Error deleting printer hub:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteHubByName = async (printerName) => {
    if (!window.confirm(`Are you sure you want to delete the printer hub: "${printerName}"?`)) return;

    setLoading(true);
    try {
      // Step 1: Query Firestore for the document with the given name
      const q = query(collection(db, "printerhubs"), where("name", "==", printerName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Printer hub not found");
        setLoading(false);
        return;
      }

      // Step 2: Get the document ID and delete it
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "printerhubs", docSnapshot.id));
      });

      await fetchPrinterHubs();
      setIsManageModalOpen(false);
    } catch (err) {
      setError("Failed to delete printer hub");
      console.error("Error deleting printer hub:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (hubid, newStatus) => {
    if (!hubid) {
      console.error("Invalid hub object:", hubid);
      setError("Invalid printer hub data");
      return;
    }

    setLoading(true);
    try {
      const hubRef = doc(db, "printerhubs", hubid); // Use the actual Firestore document ID
      const hubSnap = await getDoc(hubRef);

      if (!hubSnap.exists()) {
        throw new Error(`No document found for ID: ${hubid}`);
      }

      await updateDoc(hubRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(), // Track update time
      });

      await fetchPrinterHubs(); // Refresh the list
      setIsManageModalOpen(false);
    } catch (err) {
      setError("Failed to update hub status");
      console.error("Error updating hub status:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!formData.id?.trim() || !formData.name?.trim() || !formData.address?.trim()) {
      setError("ID, name, and address are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure location is an array
      const locationArray = Array.isArray(formData.location) ? formData.location : [0, 0];

      const dataToSave = {
        ...formData,
        location: locationArray,
        updatedAt: new Date().toISOString()
      };

      const hubRef = doc(db, "printerhubs", formData.id.trim());

      if (editingHub) {
        // **📝 Update existing hub**
        await updateDoc(hubRef, dataToSave);
      } else {
        // **🔍 Check if a hub with the same ID already exists**
        const existingHub = await getDoc(hubRef);

        if (existingHub.exists()) {
          setError("A printer hub with this ID already exists.");
          setLoading(false);
          return;
        }

        // **🆕 Add new hub with the given ID**
        await setDoc(hubRef, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
          rating: 5.0
        });
      }

      await fetchPrinterHubs();
      setIsModalOpen(false);
    } catch (err) {
      setError(editingHub ? "Failed to update printer hub" : "Failed to add printer hub");
      console.error("Error saving printer hub:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setAdminUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => window.location.href = '/'}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-gray-800">PrintSuit Admin</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-30 lg:relative lg:z-auto 
        ${isSidebarOpen ? 'block' : 'hidden lg:block'}
      `}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden "
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar Content */}
        <div className="w-64 bg-white shadow-md h-full relative z-40">
          <div className="p-5 border-b hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-800">PrintSuit Admin</h1>
          </div>
          <nav className="p-4">
            {[
              { name: 'Overview', icon: <BarChart2 />, page: 'overview' },
              { name: 'Printer Management', icon: <Printer />, page: 'printers' },
              { name: 'Print Jobs', icon: <Activity />, page: 'jobs' },
              { name: 'User Management', icon: <Users />, page: 'users' },
              { name: 'Error Logs', icon: <AlertCircle />, page: 'errors' },
              { name: 'Settings', icon: <Settings />, page: 'settings' }
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  setActivePage(item.page);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center w-full p-3 mb-2 rounded-lg transition-colors 
                  ${activePage === item.page ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {React.cloneElement(item.icon, { className: 'mr-3' })}
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:flex w-[100%]">

        {/* <div className="hidden lg:block w-64" /> Sidebar spacer */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 ">
         
          {activePage === 'overview' && (
            <>
             <div className="w-full mx-auto bg-blue-500 text-white p-8 rounded-lg flex justify-between items-center mb-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Welcome back Aibal <span role="img" aria-label="waving hand">👋</span></h1>
                <p className="text-lg">
                  This dashboard is being updated. Expect improvements<br />
                  and possible bugs. Thanks for your patience!
                </p>
              </div>

              <div className="flex space-x-4">
                <button className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Start Learning
                </button>
                <button className="bg-transparent border border-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors">
                  Join Learning
                </button>
                <button className="bg-transparent border border-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors">
                  Report Issues
                </button>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src="/api/placeholder/240/320"
                alt="Character with glasses holding a tablet"
                className="h-48"
              />
            </div>
          </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                
                {printerStats.map((stat) => (
                  <div key={stat.name} className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex items-center">
                    
                    {stat.icon}
                    <div className="ml-4">
                      <p className="text-gray-500 text-sm">{stat.name}</p>
                      <h2 className="text-xl sm:text-2xl font-bold">{stat.value}</h2>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-semibold">Recent Errors</h3>
                  <button onClick={fetchPrinterHubs} className="text-blue-600 hover:underline flex items-center">
                    <RefreshCw size={16} className="mr-2" /> Refresh
                  </button>
                </div>
                <div className="min-w-full overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Error Code</th>
                        <th className="p-3 text-left">Printer</th>
                        <th className="p-3 text-left">Time</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentErrors.map((error) => (
                        <tr key={error.code} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-red-600">{error.code}</td>
                          <td className="p-3">{error.printer}</td>
                          <td className="p-3 text-gray-500">{error.time}</td>
                          <td className="p-3">
                            <button className="text-blue-600 hover:underline">Resolve</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activePage === 'printers' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Printer className="mr-3" /> Printer Hubs
                </h2>
                <button
                  onClick={() => handleOpenModal(null)}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto justify-center"
                >
                  <Plus size={20} className="mr-2" /> Add Hub
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {printerHubs.map((hub) => (
                  <PrinterHubCard
                    key={hub.id}
                    hub={hub}
                    onEdit={handleOpenModal}
                    onManage={handleManageHub}
                  />
                ))}
              </div>
            </div>
          )}

          {activePage === 'users' && (
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Users className="mr-3" /> User Management
              </h2>
              <UserManagement />
            </div>
          )}

          {activePage === 'jobs' && (
            <PrintJobMonitoring />
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <PrinterHubModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          error={error}
          editingHub={editingHub}
        />
      )}

      {isManageModalOpen && managingHub && (
        <ManageHubModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          hub={managingHub}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteHub}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default PrintSuitAdminDashboard;