import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, doc, updateDoc } from "./firebase";
import { Power, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Match exact Firebase structure
        name: doc.data().name || 'gfrgfg',
        email: doc.data().email || '',
        photo: doc.data().photo || '',
        role: doc.data().role || 'user',
        createdAt: doc.data().createdAt || new Date().toISOString(),
      }));
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name} 
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
