// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import axios from 'axios';
// import {
//     GoogleAuthProvider,
//     signInWithPopup,
//     createUserWithEmailAndPassword,
//     sendEmailVerification,
// } from "firebase/auth";
// import { auth, db } from "./component/firebase";
// import { setDoc, doc } from "firebase/firestore";
// import { toast } from "react-toastify";

// const SignupModal = ({ isOpen, onClose, navigate, switchToLogin }) => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const errorMessages = {
//         "auth/wrong-password": "Incorrect password. Please try again.",
//         "auth/user-not-found": "No account found with this email.",
//         "auth/email-already-in-use": "This email is already registered.",
//         "network-error": "Network issue. Check your internet connection.",
//         "default": "An unexpected error occurred. Please try again.",
//     };

//     if (!isOpen) return null;

//     const googleLogin = async () => {
//         try {
//           const provider = new GoogleAuthProvider();
//           const result = await signInWithPopup(auth, provider);
//           const user = result.user;
    
//           if (user.emailVerified) {
//             // Get JWT token from backend
//             const response = await axios.post('http://localhost:5000/auth/google', {
//               uid: user.uid,
//               email: user.email,
//               name: user.displayName,
//               photo: user.photoURL
//             });
    
//             // Store JWT token
//             localStorage.setItem('token', response.data.token);
           
    
//             toast.success("Successfully logged in with Google", { position: "top-center" });
//             navigate("/locate");
//             onClose();
//           } else {
//             toast.warning("Please verify your Gmail before proceeding.", { position: "top-center" });
//           }
//         } catch (error) {
//           toast.error(`Google login failed: ${error.message}`, { position: "top-center" });
//         }
//       };
//     const handleSignup = async (e) => {
//         e.preventDefault();

//         if (password !== confirmPassword) {
//             toast.error("Passwords do not match!", { position: "top-center" });
//             return;
//         }

//         try {
//             setLoading(true);
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             // Send email verification
//             await sendEmailVerification(user);

//             // Save user info to Firestore
//             console.log(user)
//             await setDoc(doc(db, "Users", user.uid), {
//                 name:name,
//                 email: user.email,
//                 photo: user.photoURL || "",
//                 role: "user",
//             });

//             toast.success(
//                 "Account created successfully! A verification email has been sent to your email address.",
//                 { position: "top-center" }
//             );
//             onClose();
//             switchToLogin();
//         } catch (error) {
//             const message = errorMessages[error.code] || errorMessages["default"];
//             toast.error(`Error: ${message}`, { position: "top-center" });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative transform transition-all">
//                 <button
//                     onClick={onClose}
//                     className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
//                 >
//                     <X size={20} />
//                 </button>

//                 <div className="p-8">
//                     <div className="head mb-6 text-center">
//                         <div className="text-2xl font-bold text-[#2d79f3] mb-2">PrintSuit</div>
//                         <div className="text-sm text-gray-600">Create Account</div>
//                     </div>

//                     <form onSubmit={handleSignup} className="space-y-4">
//                     <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Name
//                             </label>
//                             <input
//                                 type="text"
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
//                                 placeholder="Enter your Name"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Email
//                             </label>
//                             <input
//                                 type="email"
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
//                                 placeholder="Enter your Email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                             />
//                         </div>
                        
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Password
//                             </label>
//                             <input
//                                 type="password"
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
//                                 placeholder="Enter your Password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Confirm Password
//                             </label>
//                             <input
//                                 type="password"
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
//                                 placeholder="Confirm your Password"
//                                 value={confirmPassword}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 required
//                             />
//                         </div>

//                         <div className="flex items-center">
//                             <input
//                                 type="checkbox"
//                                 className="h-4 w-4 rounded border-gray-300 text-[#2d79f3] focus:ring-[#2d79f3]"
//                             />
//                             <label className="ml-2 text-sm text-gray-700">
//                                 Remember me
//                             </label>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full rounded-md bg-[#2d79f3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1b5dc7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading ? "Signing Up..." : "Sign Up"}
//                         </button>
//                     </form>

//                     <div className="mt-6 text-center">
//                         <p className="text-sm text-gray-600">
//                             Already have an account?{' '}
//                             <button
//                                 onClick={switchToLogin}
//                                 className="font-medium text-[#2d79f3] hover:text-[#1b5dc7]"
//                             >
//                                 Sign In
//                             </button>
//                         </p>

//                         <div className="mt-4">
//                             <div className="relative">
//                                 <div className="absolute inset-0 flex items-center">
//                                     <div className="w-full border-t border-gray-300"></div>
//                                 </div>
//                                 <div className="relative flex justify-center text-sm">
//                                     <span className="bg-white px-2 text-gray-500">Or With</span>
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={googleLogin}
//                                 className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//                             >
//                                 <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
//                                     <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"></path>
//                                 </svg>
//                                 Continue with Google
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SignupModal;





import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import axios from 'axios';
import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "./component/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const SignupModal = ({ isOpen, onClose, navigate, switchToLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation states
    const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const errorMessages = {
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/email-already-in-use": "This email is already registered.",
        "network-error": "Network issue. Check your internet connection.",
        "default": "An unexpected error occurred. Please try again.",
    };

    // Password validation function
    const validatePassword = (pass) => {
        return {
            minLength: pass.length >= 8,
            hasUppercase: /[A-Z]/.test(pass),
            hasLowercase: /[a-z]/.test(pass),
            hasNumber: /[0-9]/.test(pass),
            hasSpecial: /[!@#$%^&*]/.test(pass)
        };
    };

    // Update password validation on change
    useEffect(() => {
        if (password) {
            const results = validatePassword(password);
            setValidations(results);
        } else {
            setValidations({
                minLength: false,
                hasUppercase: false,
                hasLowercase: false,
                hasNumber: false,
                hasSpecial: false
            });
        }
    }, [password]);

    // Check if passwords match
    useEffect(() => {
        if (confirmPassword || password) {
            setPasswordsMatch(password === confirmPassword && password !== '');
        }
    }, [password, confirmPassword]);

    if (!isOpen) return null;

    const googleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user.emailVerified) {
                const response = await axios.post('https://printsuit-backend.onrender.com/auth/google', {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    photo: user.photoURL
                });

                localStorage.setItem('token', response.data.token);
                toast.success("Successfully logged in with Google", { position: "top-center" });
                navigate("/locate");
                onClose();
            } else {
                toast.warning("Please verify your Gmail before proceeding.", { position: "top-center" });
            }
        } catch (error) {
            toast.error(`Google login failed: ${error.message}`, { position: "top-center" });
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const isValid = Object.values(validations).every(Boolean);
        if (!isValid) {
            toast.error("Please meet all password requirements", { position: "top-center" });
            return;
        }

        if (!passwordsMatch) {
            toast.error("Passwords do not match!", { position: "top-center" });
            return;
        }

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            
            await setDoc(doc(db, "Users", user.uid), {
                name: name,
                email: user.email,
                photo: user.photoURL || "",
                role: "user",
            });

            toast.success(
                "Account created successfully! A verification email has been sent.",
                { position: "top-center" }
            );
            onClose();
            switchToLogin();
        } catch (error) {
            const message = errorMessages[error.code] || errorMessages["default"];
            toast.error(`Error: ${message}`, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };
    const PasswordStrengthIndicator = ({ validations }) => {
        const requirements = [
            { key: 'minLength', icon: '●', title: 'Minimum 8 characters' },
            { key: 'hasUppercase', icon: '●', title: 'Contains uppercase letter' },
            { key: 'hasLowercase', icon: '●', title: 'Contains lowercase letter' },
            { key: 'hasNumber', icon: '●', title: 'Contains number' },
            { key: 'hasSpecial', icon: '●', title: 'Contains special character' }
        ];

        return (
            <div className="mt-3 flex justify-center gap-3">
                {requirements.map(({ key, icon, title }) => (
                    <div
                        key={key}
                        className="relative group"
                        title={title}
                    >
                        <div
                            className={`w-12 h-[2px] rounded-full transition-colors ${
                                validations[key]
                                    ? 'bg-green-500'
                                    : 'bg-red-300'
                            }`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {title}
                        </div>
                    </div>
                ))}
            </div>
        );
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
                        <div className="text-sm text-gray-600">Create Account</div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
                                placeholder="Enter your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]"
                                placeholder="Enter your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {password && <PasswordStrengthIndicator validations={validations} />}
                    </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`w-full rounded-lg border ${
                                        confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300'
                                    } px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2d79f3] focus:ring-1 focus:ring-[#2d79f3]`}
                                    placeholder="Confirm your Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
                            )}
                        </div>

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
                            type="submit"
                            disabled={loading || !Object.values(validations).every(Boolean) || !passwordsMatch}
                            className="w-full rounded-md bg-[#2d79f3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1b5dc7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={switchToLogin}
                                className="font-medium text-[#2d79f3] hover:text-[#1b5dc7]"
                            >
                                Sign In
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
                                onClick={googleLogin}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

export default SignupModal;