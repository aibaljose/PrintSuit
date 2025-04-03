import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth, db } from "./component/firebase";
import { toast } from "react-toastify";
import axios from 'axios';
import { collection, doc, getDoc } from "firebase/firestore";

const LoginModal = ({ isOpen, onClose, navigate, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Google Login
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.emailVerified) {
        // Check if user exists and is active
        const userDocRef = doc(db, "Users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().isActive === false) {
          toast.error("Your account has been disabled. Please contact support.", { position: "top-center" });
          return;
        }

        // Continue with existing login logic
        const response = await axios.post('http://localhost:5000/auth/google', {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
          isGoogleLogin: true // Flag to indicate this is Google login
        });

        // Store JWT token
        localStorage.setItem('token', response.data.token);

        toast.success("Successfully logged in with Google", { position: "top-center" });
        navigate("/locate");
        onClose();
      } else {
        toast.warning("Please verify your email before proceeding.", { position: "top-center" });
      }
    } catch (error) {
      toast.error(`Google login failed: ${error.message}`, { position: "top-center" });
    }
  };

  // Email and Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        // Get user document and check active status
        const userDocRef = doc(db, "Users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();

        if (userData?.isActive === false) {
          toast.error("Your account has been disabled. Please contact support.", { position: "top-center" });
          return;
        }

        // Continue with existing login logic
        const response = await axios.post('https://printsuit-backend.onrender.com/login', {
          email: user.email,
          uid: user.uid,
          name: userData?.name || user.displayName, // Use optional chaining
        });

        localStorage.setItem('token', response.data.token);
        console.log(response.data.token);

        toast.success("Successfully logged in", { position: "top-center" });
        navigate("/locate");
        onClose();
      } else {
        toast.warning("Please verify your email to continue.", { position: "top-center" });
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  // Error handler function
  const handleLoginError = (error) => {
    switch (error.code) {
      case "auth/invalid-credential":
        toast.error("Invalid credentials. Please check your email and password.", { position: "top-center" });
        break;
      case "auth/wrong-password":
        toast.error("Incorrect password.", { position: "top-center" });
        break;
      case "auth/invalid-email":
        toast.error("Invalid email format.", { position: "top-center" });
        break;
      case "auth/too-many-requests":
        toast.error("Too many login attempts. Please try again later.", { position: "top-center" });
        break;
      case "auth/user-disabled":
        toast.error("This account has been disabled.", { position: "top-center" });
        break;
      default:
        toast.error(`Login failed: ${error.message}`, { position: "top-center" });
        break;
    }
  };

  // Forgot Password Function
  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning("Please enter your email to reset your password.", { position: "top-center" });
      return;
    }
  
    try {
      // Check if the user exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
  
      if (signInMethods.length === 0) {
        toast.error("No account found with this email.", { position: "top-center" });
        return;
      }
  
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.", { position: "top-center" });
  
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Invalid email format.", { position: "top-center" });
          break;
        default:
          toast.error(`Error: ${error.message}`, { position: "top-center" });
          break;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="head mb-6 text-center">
            <div className="text-2xl font-bold text-[#2d79f3] mb-2">PrintSuit</div>
            <div className="text-sm text-gray-600">Welcome Back!</div>
          </div>

          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#2d79f3] focus:ring-[#2d79f3]"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-[#2d79f3] hover:text-[#1b5dc7]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#2d79f3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1b5dc7] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  onClose();
                  switchToSignup();
                }}
                className="font-medium text-[#2d79f3] hover:text-[#1b5dc7]"
              >
                Sign Up
              </button>
            </p>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={googleLogin}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;