import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, doc, updateDoc } from "./firebase";
import { Power, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchHubs();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersData = await Promise.all(querySnapshot.docs.map(async doc => {
        const userData = doc.data();
        let hubData = null;
        
        if (userData.hubId) {
          const hubDoc = await getDocs(collection(db, "PrinterHubs"));
          const hub = hubDoc.docs.find(h => h.id === userData.hubId);
          if (hub) {
            hubData = {
              id: hub.id,
              name: hub.data().hubName,
              location: hub.data().location
            };
          }
        }

        return {
          id: doc.id,
          ...userData,
          name: userData.name || 'Unknown',
          email: userData.email || '',
          photo: userData.photo || '',
          role: userData.role || 'user',
          isActive: userData.isActive ?? true,
          createdAt: userData.createdAt || new Date().toISOString(),
          hub: hubData
        };
      }));
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHubs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "printerhubs"));
      const hubsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().hubName || 'Unnamed Hub', // Try both name and hubName
        address: doc.data().address || doc.data().location || '',
        ...doc.data()
      }));
      console.log("Fetched hubs:", hubsData); // Debug log
      setHubs(hubsData);
    } catch (err) {
      console.error("Error fetching hubs:", err);
      setError("Failed to fetch hubs");
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userRole) => {
    // Prevent disabling admin users
    if (userRole === 'admin') {
      setError("Admin users cannot be disabled");
      return;
    }

    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user status");
      console.error("Error updating user status:", err);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user role");
      console.error("Error updating user role:", err);
    }
  };

  const assignHub = async (userId, hubId) => {
    try {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, {
        hubId: hubId,
        updatedAt: new Date().toISOString()
      });
      await fetchUsers();
    } catch (err) {
      setError("Failed to assign hub");
      console.error("Error assigning hub:", err);
    }
  };

  return (
    <div className=" p-4">
      <div className="flex justify-between items-center mb-4">
       
        <button
          onClick={fetchUsers}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {users.map((user) => (
          <div key={user.id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200  bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center space-x-4 mb-4">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <span className="text-sm font-medium text-gray-600">Role:</span>
                {user.role !== 'admin' ? (
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-md text-sm border border-gray-300 
                             bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                             transition-colors duration-200"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {user.role}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:justify-between">
                <span className="text-sm font-medium text-gray-600">Hub:</span>
                {user.role !== 'admin' && user.role !== 'user' && (
                  <div className="flex flex-col space-y-2 w-full sm:w-auto">
                    <select
                      value={user.hubId || ''}
                      onChange={(e) => assignHub(user.id, e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 rounded-md text-sm border border-gray-300 
                               bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                               transition-colors duration-200"
                    >
                      <option value="">Select Hub</option>
                      {hubs && hubs.length > 0 ? (
                        hubs.map(hub => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name || hub.hubName}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No hubs available</option>
                      )}
                    </select>
                    {user.hub && (
                      <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                        <div className="font-medium">{user.hub.name}</div>
                        <div className="text-gray-500 text-xs mt-1">{user.hub.location}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <span className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => toggleUserStatus(user.id, user.isActive, user.role)}
                  disabled={user.role === 'admin'}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200 ${
                    user.role === 'admin' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : user.isActive 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                >
                  <Power size={14} className="mr-2" />
                  {user.role === 'admin' ? 'Admin' : user.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
