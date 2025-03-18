import React, { useState } from 'react';
import { X } from 'lucide-react';
import { db, collection, getDocs, query, where } from "./firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First authenticate with Firebase
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Then check if user is admin in Firestore
      const q = query(
        collection(db, "Users"),
        where("email", "==", email),
        where("role", "==", "admin")
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await auth.signOut(); // Sign out if not admin
        setError('Access denied. Only admin users are allowed.');
        return;
      }

      const adminUser = {
        ...querySnapshot.docs[0].data(),
        uid: firebaseUser.uid,
      };
      onLogin(adminUser);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.code === 'auth/invalid-credential' ? 'Invalid email or password' :
        err.code === 'auth/user-not-found' ? 'User not found' :
        'Failed to authenticate. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin Login</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
