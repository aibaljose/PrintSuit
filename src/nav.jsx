import React, { useState, useEffect } from "react";
import { auth, db } from "./component/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Upload, 
  Settings, 
  User as UserIcon, 
  LogOut,
  Menu 
} from "react-feather";

const Nav = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const NavItem = ({ icon: Icon, path, label }) => {
    const isActive = location.pathname === path;
    return (
      <div 
        onClick={() => navigate(path)}
        className={`flex flex-col items-center cursor-pointer ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <Icon className="h-6 w-6" />
        <span className="text-xs">{label}</span>
      </div>
    );
  };

  const renderProfileIcon = () => {
    return userDetails?.photo ? (
      <img
        src={userDetails.photo}
        alt="Profile"
        className="rounded-full h-10 w-10 object-cover"
      />
    ) : (
      <UserIcon className="h-10 w-10 text-gray-600" />
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white fixed top-0 left-0 right-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            PrintSuit
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex space-x-4">
              <span onClick={() => navigate("/")} className="cursor-pointer hover:text-blue-600">Home</span>
              <span onClick={() => navigate("/locate")} className="cursor-pointer hover:text-blue-600">Services</span>
              <span onClick={() => navigate("/about")} className="cursor-pointer hover:text-blue-600">About</span>
            </div>

            {userDetails ? (
              <div className="relative">
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer"
                >
                  {renderProfileIcon()}
                </div>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <div className="py-1">
                      <div 
                        onClick={() => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Profile Settings
                      </div>
                      <div 
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer flex items-center"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white z-10 flex justify-between items-center p-4 shadow-sm">
          <div 
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            PrintSuit
          </div>
          <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-20 pt-16">
            <div className="flex flex-col space-y-4 p-4">
              <div onClick={() => navigate("/")} className="text-lg">Home</div>
              <div onClick={() => navigate("/locate")} className="text-lg">Services</div>
              <div onClick={() => navigate("/about")} className="text-lg">About</div>
              {userDetails ? (
                <>
                  <div onClick={() => navigate("/profile")} className="text-lg">Profile</div>
                  <div 
                    onClick={handleLogout}
                    className="text-lg text-red-500"
                  >
                    Logout
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => navigate("/login")}
                  className="text-lg"
                >
                  Login
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 flex justify-around py-3">
          <NavItem icon={Home} path="/" label="Home" />
          <NavItem icon={Upload} path="/locate" label="service" />
          <NavItem icon={Settings} path="/services" label="Services" />
          {userDetails ? (
            <div 
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center cursor-pointer"
            >
              {userDetails?.photo ? (
                <img
                  src={userDetails.photo}
                  alt="Profile"
                  className="rounded-full h-6 w-6 object-cover"
                />
              ) : (
                <UserIcon className="h-6 w-6" />
              )}
              <span className="text-xs">Profile</span>
            </div>
          ) : (
            <NavItem icon={UserIcon} path="/login" label="Login" />
          )}
        </div>
      </div>
    </>
  );
};

export default Nav;