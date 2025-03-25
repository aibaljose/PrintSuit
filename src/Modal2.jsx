import React, { useState } from 'react';
import { ChevronDown, Heart, Upload, Star, MapPin, Printer } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';
import hun from "./assets/hun.png";
const Modal2 = ({ setisopen, hub }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const sections = [
    {
      title: "Print Details",
      icon: Printer,
      content: [
        { label: "Quality", value: "High Resolution", badge: "PRO" },
        { label: "Processing", value: "15-20 mins", badge: "FAST" },
        { label: "Paper Size", value: "A3/A4/A5" },
      ]
    },
    {
      title: "Location & Hours",
      content: [
        { label: "Address", value: hub.address },
        { label: "Working Hours", value: "9AM - 8PM" },
        { label: "Rating", value: `${hub.rating}/5` },
      ]
    }
  ];

  const [openSection, setOpenSection] = useState("Print Details");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-lg p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-5xl w-full mx-auto shadow-2xl border border-white/20 transition-all duration-300 ease-out hover:shadow-indigo-500/10">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/5 p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                    Available Now
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{hub.name}</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} className="text-indigo-500" />
                  <span className="text-sm font-medium">{hub.address}</span>
                </div>
              </div>
              <button
                onClick={() => setisopen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-3 mb-8">
              {sections.map((section) => (
                <div 
                  key={section.title}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:border-indigo-100 transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenSection(section.title)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50/50 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {section.icon && <section.icon size={18} className="text-indigo-500" />}
                      <span className="font-semibold text-gray-900">{section.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform duration-200 text-gray-400
                        ${openSection === section.title ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openSection === section.title && (
                    <div className="px-6 py-4 space-y-3 animate-fadeIn">
                      {section.content.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{item.value}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Price per page</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-gray-900">₹1</p>
                  <span className="text-sm font-medium text-gray-500">/color</span>
                </div>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-pink-50 hover:bg-pink-100' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-200 ${
                    isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
                  }`}
                />
              </button>
              <button 
                onClick={() => navigate("/upload", { state: { hubname: hub.name, hubid: hub.id } })}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                  hover:bg-indigo-500 transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Print Now
                <Upload size={18} className="animate-bounce" />
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden md:block w-2/5 bg-gray-50 rounded-r-2xl overflow-hidden relative">
            <button
              onClick={() => setisopen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="w-full h-full relative group">
              <img
                src={hun}
                alt="Printer Hub"
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal2;