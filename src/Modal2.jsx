import React, { useState } from 'react';
import printer from "./assets/color.png";
import { useNavigate } from "react-router-dom";

const Modal2 = ({ setisopen, hub }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");

  const renderContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <>
            <p className="text-sm md:text-base leading-relaxed mb-4">
              {hub.description || "No description available."}
            </p>
            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 py-2">
              <span className="text-gray-500 text-sm md:text-base">Color</span>
              <span className="text-gray-900 text-sm md:text-base text-right">Blue</span>
              <span className="text-gray-500 text-sm md:text-base">Size</span>
              <span className="text-gray-900 text-sm md:text-base text-right">Medium</span>
              <span className="text-gray-500 text-sm md:text-base">Quantity</span>
              <span className="text-gray-900 text-sm md:text-base text-right">4</span>
            </div>
          </>
        );
      case "reviews":
        return (
          <div>
            <p className="leading-relaxed mb-4">User Reviews:</p>
            <ul className="space-y-2">
              {["Great quality prints!", "Fast and efficient service.", "Could improve on availability."].map((review, index) => (
                <li key={index} className="flex items-center">
                  {[...Array(index + 3)].map((_, starIndex) => (
                    <span key={starIndex} className="text-yellow-500">★</span>
                  ))}
                  <span className="ml-2 text-sm">{review}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case "details":
        return (
          <div>
            <p className="leading-relaxed mb-4">Details:</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <strong>Location:</strong>
                <span>{hub.address}</span>
              </div>
              <div className="flex justify-between">
                <strong>Type:</strong>
                <span>Color Printer</span>
              </div>
              <div className="flex justify-between">
                <strong>Rating:</strong>
                <span>{hub.rating} ★</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-auto overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Text Content */}
          <div className="w-full md:w-1/2 p-6">
            <h2 className="text-sm text-gray-500 tracking-widest">{hub.address}</h2>
            <h1 className="text-2xl md:text-3xl font-medium mb-4">{hub.name}</h1>
            
            {/* Tabs */}
            <div className="flex mb-4">
              {["description", "reviews", "details"].map((tab) => (
                <button
                  key={tab}
                  className={`flex-grow py-2 text-sm md:text-lg px-1 capitalize 
                    ${activeTab === tab 
                      ? "text-indigo-500 border-b-2 border-indigo-500" 
                      : "border-b-2 border-gray-300"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Dynamic Content */}
            {renderContent()}
            
            {/* Actions */}
            <div className="flex items-center mt-4">
              <span className="text-xl font-medium text-gray-900">₹ 1/<span className='text-[12px]' >per paper(color)</span></span>
              {/* <span className="text-xl font-medium text-gray-900">₹ 1/<span className='text-[12px]' >per paper(color)</span></span> */}
              <div className="ml-auto flex space-x-2">
                <button onClick={() => navigate("/upload")} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                  Upload file
                </button>
                <button className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-gray-500">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div className="hidden md:block w-1/2">
            <img
              alt="printer"
              className="w-full h-full object-cover"
              src={printer}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal2;