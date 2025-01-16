import React, { useState, useEffect } from "react";
import { auth, db } from "./component/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "react-feather";

const Nav = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const navigate = useNavigate();

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
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
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <div className="nav bg-white shadow-md flex items-center justify-between px-6 md:px-12 h-[80px]">
      {/* Logo */}
      <div
        className="title font-bold text-xl md:text-2xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        PrintSuit
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden" onClick={() => setMenuOpen((prev) => !prev)}>
        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </div>

      {/* Navigation Links */}
      <ul
        className={`${
          menuOpen ? "block" : "hidden"
        } md:flex items-center gap-6 text-gray-700 font-medium absolute md:static top-[80px] left-0 w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 z-10`}
      >
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/")}>Home</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/about")}>About</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/services")}>Services</li>
        <li className="cursor-pointer hover:text-black" onClick={() => navigate("/customer-care")}>Customer Care</li>
      </ul>

      {/* Profile Section */}
      <div className="relative hidden md:block">
        <div
          className="img cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {userDetails && userDetails.photo ? (
            <img
              className="rounded-full h-10 w-10"
              src={userDetails.photo}
              alt="User"
            />
          ) : (
            <img
              className="rounded-full h-10 w-10"
              src="https://via.placeholder.com/40"
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
