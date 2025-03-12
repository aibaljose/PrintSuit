import React, { useState, useEffect } from "react";
import { auth, db } from "./component/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Upload, Settings, User as UserIcon, LogOut, Menu } from "react-feather";
import { jwtDecode } from "jwt-decode";
import P from  "./assets/p.png";
import { toast } from "react-toastify";

const Nav = ({ switchToSignup, onUserDetailsUpdate  }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token) {
        console.log("No token found. Redirecting...");
        navigate("/");
      }
        
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUserDetails(decoded);
          // onUserDetailsUpdate(decoded);
          console.log(decoded.User);
        } catch (error) {
          console.error("Invalid token:", error);

          localStorage.removeItem("token");
          navigate("/");
        }
      }

      // auth.onAuthStateChanged(async (user) => {
      //   if (user) {
      //     const docRef = doc(db, "Users", user.uid);
      //     const docSnap = await getDoc(docRef);
      //     if (docSnap.exists()) {
      //       const userData = docSnap.data();
      //       setUserDetails(userData);
      //       localStorage.setItem("token", JSON.stringify(userData));
      //     }
      //   } else if (!token) {
      //     navigate("/");
      //   }
      // });
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("token");
      setUserDetails(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const NavItem = ({ icon: Icon, path, label }) => {
    const isActive = location.pathname === path;
    return (
      <div
        onClick={() => navigate(path)}
        className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all duration-300 ${isActive
            ? "text-indigo-600 bg-indigo-50"
            : "text-gray-600 hover:text-indigo-500 hover:bg-gray-100"
          }`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium mt-1">{label}</span>
      </div>
    );
  };

  const renderProfileIcon = () => {
    return userDetails?.photo ? (
      <img
        src={userDetails.photo}
        alt="Profile"
        className="rounded-full h-12 w-12 object-cover border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
      />
    ) : (
      <UserIcon className="h-12 w-12 text-gray-600 p-1 rounded-full border-2 border-gray-200 hover:border-indigo-400 transition-colors" />
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white fixed top-0 left-0 right-0 z-10 h-[80px] mmmm z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="text-2xl font-extrabold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors duration-300"
            onClick={() => navigate("/")}
          >
          PrintSuit
            {/* <img src={P} alt="" height="80px" width="80px" /> */}
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex space-x-6 ">
              <span className={`text-[16px] text-[#969696] font-bold-200 cursor-pointer transition-colors duration-300`} onClick={() => navigate("/")}>
                Home
              </span>
              <span className={`text-[16px] text-[#969696] font-medium cursor-pointer transition-colors duration-300`} onClick={() => {
                if (userDetails) {
                  navigate("/locate");
                } else {
                  toast.warning(`Please login to access this page`, { position: "top-center" });
                  // alert("Please login to access this page");
                }
              }}>
                Print
              </span>
              <span className={`text-[16px] text-[#969696] font-medium cursor-pointer transition-colors duration-300`}onClick={() => {
                if (userDetails) {
                  navigate("/orders");
                } else {
                  toast.warning(`Please login to access this page`, { position: "top-center" });
                }
              }}>
                
                Orders
              </span>
              <span className={`text-[16px] text-[#969696] font-medium cursor-pointer transition-colors duration-300`} onClick={() => navigate("/support")}>
                support
              </span>
              {/* {["Home", "Locate", "About"].map((item, idx) => (
                
                <span  
                  key={idx}
                  onClick={() => navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
                  className={`text-sm font-medium cursor-pointer transition-colors duration-300 ${
                    location.pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`)
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-500"
                  }`}
                >
                  {item}
                </span>
              ))} */}
            </div>

            {userDetails ? (
              <div className="relative">
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer focus:outline-none"
                >
                  {renderProfileIcon()}
                 
                </div>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden">
                    <div className="py-2">
                      <div
                        onClick={() => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 cursor-pointer"
                      >
                        Profile Settings
                      </div>
                      <div
                        onClick={handleLogout}
                        className="px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </div>
                    </div>
              
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => switchToSignup()}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Print Now              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white z-10 flex justify-between items-center p-4 shadow-md">
          <div
            className="text-xl font-extrabold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors duration-300"
            onClick={() => navigate("/")}
          >
            PrintSuit
          </div>
          <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {renderProfileIcon()}
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {/* {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-20 pt-16">
            <div className="flex flex-col space-y-6 p-6">
              {["Home", "Services", "About","caotact", "Profile", "Logout"].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item === "Logout" && userDetails) {
                      handleLogout();
                    } else if (item === "Profile" && userDetails) {
                      navigate("/profile");
                    } else if (!userDetails && item === "Logout") {
                      navigate("/login");
                    } else {
                      navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`text-lg font-medium cursor-pointer transition-colors duration-200 ${
                    item === "Logout" && userDetails
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-700 hover:text-indigo-600"
                  } ${!userDetails && item === "Profile" ? "hidden" : ""} ${
                    !userDetails && item === "Logout" ? "text-gray-700" : ""
                  }`}
                >
                  {item === "Logout" && !userDetails ? "Login" : item}
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 flex justify-around py-2 shadow-lg">
          <NavItem icon={Home} path="/" label="Home" />
          <NavItem icon={Upload} path="/locate" label="Services" />
          <NavItem icon={Settings} path="/about" label="About" />
          {userDetails ? (
            <NavItem icon={UserIcon} path="/profile" label="Profile" />
          ) : (
            <NavItem icon={UserIcon} path="/login" label="Login" />
          )}
        </div>
      </div>
    </>
  );
};

export default Nav;