import React, { useState } from 'react';
import { ChevronRight, Heart, Upload, Star, MapPin, Printer } from 'lucide-react';
import printer from "./assets/color.png";
import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';
const Modal2 = ({ setisopen, hub }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [isLiked, setIsLiked] = useState(false);

  const TabButton = ({ tab }) => (
    <button
      className={`group flex-1 py-4 relative transition-colors duration-200
        ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
      onClick={() => setActiveTab(tab)}
    >
      <span className="text-sm font-medium capitalize">{tab}</span>
      {activeTab === tab && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
      )}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              {hub.description || "No description available."}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Color", value: "Blue" },
                { label: "Size", value: "Medium" },
                { label: "Quantity", value: "4" }
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-4">

            {[
              { rating: 5, text: "Great quality prints!", user: "Alex M." },
              { rating: 4, text: "Fast and efficient service.", user: "Sarah K." },
              { rating: 3, text: "Could improve on availability.", user: "John D." }
            ].map((review, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">{review.user}</span>
                </div>
                <p className="text-gray-600">{review.text}</p>
              </div>
            ))}
          </div>
        );
      case "details":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="font-medium mb-1">Location</p>
                <p className="text-gray-600">{hub.address}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <Printer className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="font-medium mb-1">Printer Type</p>
                <p className="text-gray-600">Color Printer</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <Star className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="font-medium mb-1">Rating</p>
                <p className="text-gray-600">{hub.rating} out of 5</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm">

      <div className="bg-white rounded-2xl max-w-5xl w-full mx-auto shadow-2xl">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-8">
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            
              <MapPin size={16} />
              {hub.address}
            </div>
            <h1 className="text-3xl font-semibold mb-8">{hub.name}</h1>

            <div className="flex border-b mb-6">
              {["description", "reviews", "details"].map((tab) => (
                <TabButton key={tab} tab={tab} />
              ))}
            </div>

            <div className="mb-8">
              {renderContent()}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Price per page</p>
                <p className="text-2xl font-semibold">₹1 <span className="text-sm font-normal text-gray-500">/ color</span></p>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-colors duration-200 ${isLiked ? 'bg-pink-50' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-200 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-600'
                    }`}
                />
              </button>
              <button onClick={() => navigate("/upload", { state: { hubname: hub.name } })} className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors duration-200">
                Upload file
                <Upload size={18} />
              </button>
            </div>
          </div>

          <div className="hidden md:block w-1/2 bg-gray-100 rounded-r-2xl overflow-hidden relative">
          <button
              onClick={() => setisopen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
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