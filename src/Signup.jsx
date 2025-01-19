import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "./component/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          navigate("/locate"); // Redirect verified users
        } else {
          toast.warning("Please verify your email address to access the site.", {
            position: "top-center",
          });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        toast.error(`Google login failed: ${error.message}`, { position: "top-center" });
      });
  };

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

      // Send email verification
      await sendEmailVerification(user);

      // Save user info to Firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        firstName: "",
        lastName: "",
        photo: user.photoURL || "",
      });

      toast.success(
        "Account created successfully! A verification email has been sent to your email address.",
        { position: "top-center" }
      );
      navigate("/login"); // Redirect to login page
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
          <div
            onClick={googleLogin}
            className="btn cursor-pointer text-black flex gap-2 items-center bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-300 transition-all ease-in duration-200"
          >
            <svg
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6"
            >
              {/* Google Icon Paths */}
              <path
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                fill="#FFC107"
              ></path>
              {/* Other Paths */}
            </svg>
            Continue with Google
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;
