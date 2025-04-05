import React, { useState, useEffect } from "react";
import "./App.css";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail, // Import this function
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "./component/firebase";
import { toast } from "react-hot-toast";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/locate");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Google Login
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        if (user.emailVerified) {
          await setDoc(doc(db, "Users", user.uid), {
            Name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            role:"user"
          });
          toast.success("User logged in successfully with Google");
          navigate("/locate");
        } else {
          toast.warning("Your Gmail is not verified. Please verify it before proceeding.");
        }
      })
      .catch((error) => {
        toast.error(`Google login failed: ${error.message}`);
      });
  };

  // Email and Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        toast.success("Successfully logged in");
        navigate("/locate");
      } else {
        toast.warning("Your email is not verified. Please verify it to continue.");
      }
    } catch (error) {
      toast.error("Login failed: " + error.message);
    }
  };

  // Forgot Password Function
  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format.");
          break;
        default:
          toast.error(`Error: ${error.message}`);
          break;
      }
    }
  };

  return (
    <div className="Login">
      <form className="form" onSubmit={handleEmailPasswordLogin}>
        <div className="head">
          <div className="tl flex align-center justify-center font-bold text-[28px] text-[#2d79f3]">PrintSuit</div>
          <div className="tl flex align-center justify-center font-normal text-[14px]">Welcome Back!</div>
        </div>
        <div className="flex-column">
          <label>Email </label>
        </div>
        <div className="inputForm">
          <input
            type="email"
            className="input"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex-column">
          <label>Password </label>
        </div>
        <div className="inputForm">
          <input
            type="password"
            className="input"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex-row">
          <div>
            <input type="checkbox" />
            <label>Remember me </label>
          </div>
          <span className="span cursor-pointer" onClick={handleForgotPassword}>
            Forgot password?
          </span>
        </div>
        <button type="submit" className="button-submit">
          Sign In
        </button>
        <p className="p">
          Don't have an account?{" "}
          <Link style={{ textDecoration: "none" }} to="/signup">
            <span className="span">Sign Up</span>
          </Link>
        </p>
        <p className="p line">Or With</p>
        <div className="flex-row">
          <div
            onClick={googleLogin}
            className="btn cursor-pointer text-black flex gap-2 items-center bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-300 transition-all ease-in duration-200"
          >
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-6">
              <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path>
            </svg>
            Continue with Google
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
