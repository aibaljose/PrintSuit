import React, { useState } from "react";
import "./App.css";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./component/firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google Login
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        if (user) {
          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            firstName: user.displayName,
            photo: user.photoURL,
            lastName: "",
          });
          toast.success("User logged in successfully with Google", {
            position: "top-center",
          });
          window.location.href = "/locate";
        }
      })
      .catch((error) => {
        toast.error(`Google login failed: ${error.message}`, { position: "top-center" });
      });
  };

  // Email and Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast.success("User logged in successfully with Email", {
        position: "top-center",
      });
      window.location.href = "/locate";
    } catch (error) {
        console.log(error)
      // Handle specific error cases
      switch (error.code) {
        case "auth/invalid-credential":
          toast.error("No user found with this email. Please sign up first.", {
            position: "top-center",
          });
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password. Please try again.", {
            position: "top-center",
          });
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format. Please enter a valid email.", {
            position: "top-center",
          });
          break;
        case "auth/too-many-requests":
          toast.error("Too many login attempts. Please try again later.", {
            position: "top-center",
          });
          break;
        default:
          toast.error(`Login failed: ${error.message}`, { position: "top-center" });
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
          <span className="span">Forgot password?</span>
        </div>
        <button type="submit" className="button-submit">Sign In</button>
        <p className="p">
          Don't have an account?{" "}
          <Link style={{ textDecoration: "none" }} to="/signup">
            <span className="span">Sign Up</span>
          </Link>
        </p>
        <p className="p line">Or With</p>
        <div className="flex-row">
          <div className="btn" onClick={googleLogin}>
            Google Sign In
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
