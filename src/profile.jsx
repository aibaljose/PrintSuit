import React, { useState, useEffect } from "react";
import { auth, db } from "./component/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure correct import
import { LogOut } from "react-feather";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const userId = decoded.uid;
          setUserDetails(decoded)

        //   const docRef = doc(db, "Users", userId);
        //   const docSnap = await getDoc(docRef);

        //   if (docSnap.exists()) {
        //     setUserDetails(docSnap.data());
        //   }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token"); // Clear invalid token
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("token"); // Remove JWT token
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {userDetails ? (
        <>
          <img
            src={userDetails.photo || "https://via.placeholder.com/150"}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover"
          />
          <h2 className="text-xl font-semibold mt-2">{userDetails.firstName} {userDetails.lastName}</h2>
          <p className="text-gray-500">{userDetails.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded flex items-center"
          >
            <LogOut className="mr-2" />
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;






