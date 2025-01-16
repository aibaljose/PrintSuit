import React, { useState, useEffect } from "react";
import { auth, db } from "./component/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility
  const navigate = useNavigate();

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(user);

        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log(docSnap.data());
        } else {
          console.log("No user data found");
        }
      } else {
        console.log("User is not logged in");
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <div className="nav flex items-center h-[80px] justify-between px-[125px] bg-[#fff] shadow-md">
      {/* Logo */}
      <div
        className="title font-bold text-[30px] cursor-pointer"
        onClick={() => navigate("/")}
      >
        PrintSuit
      </div>

      {/* Navigation Links */}
      <ul className="flex items-center justify-center gap-[40px] text-[#6B7589] font-medium">
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/")}>Home</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/about")}>About</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/services")}>Services</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/customer-care")}>Customer Care</li>
      </ul>

      {/* Profile Section */}
      <div className="relative">
        <div
          className="img cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {userDetails && userDetails.photo ? (
            <img
              className="rounded-full h-[40px] w-[40px]"
              src={userDetails.photo}
              alt="User"
            />
          ) : (
            <img
              className="rounded-full h-[40px] w-[40px]"
              src="https://via.placeholder.com/40" // Dummy profile image
              alt="Placeholder"
            />
          )}
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
            <ul className="flex flex-col">
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
              >
                Profile Settings
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/");
                }}
              >
                Home
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/about");
                }}
              >
                About
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/services");
                }}
              >
                Services
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/customer-care");
                }}
              >
                Customer Care
              </li>
              <li
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-red-500"
                onClick={handleLogout}
              >
                Sign Out
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
