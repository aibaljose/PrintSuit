import React, { useState } from "react";

import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./component/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        firstName: "",
        lastName: "",
        photo: user.photoURL || "",
      });

      toast.success("Account created successfully!", { position: "top-center" });
      navigate("/login"); // Redirect to login page after successful signup
    } catch (error) {
      toast.error(`Error: ${error.message}`, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login">
      <form className="form" onSubmit={handleSignup}>
        <div className="head">
          <div className="tl flex align-center justify-center font-bold text-[28px] text-[#2d79f3]">PrintSuit</div>
          <div className="tl flex align-center justify-center font-normal text-[14px]">Create Account</div>
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

        <div className="flex-column">
          <label>Confirm Password </label>
        </div>
        <div className="inputForm">
          <input
            type="password"
            className="input"
            placeholder="Confirm your Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex-row">
          <div>
            <input type="checkbox" />
            <label>Remember me </label>
          </div>
        </div>

        <button className="button-submit" type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="p">
          Already have an account?{" "}
          <Link style={{ textDecoration: "none" }} to="/login">
            <span className="span">Sign In</span>
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

export default Signup;
