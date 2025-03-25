import React, { useState } from "react";
import { MapPin, Star, ChevronRight, CircleDot } from "lucide-react";
import Modal2 from "./Modal2";
import printer from "./assets/color.png";

const HubCard = ({ hub }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-sm  mx-auto">
      {isOpen && <Modal2 setisopen={setIsOpen} hub={hub} />}
      
      <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          {hub.status === 'Active' ? (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-700">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100">
              <CircleDot className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{hub.status}</span>
            </div>
          )}
        </div>

        {/* Image Container */}
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          <img
            src={printer}
            alt={hub.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {hub.name}
            </h3>
            
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate">{hub.address}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{hub.rating}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-sm text-gray-500">
              {hub.reviews} Reviews
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-black text-white mt-2 px-4 py-3 rounded-xl font-medium 
                     flex items-center justify-center gap-2 group/button
                     hover:bg-gray-800 active:bg-gray-900 transition-all duration-200
                     transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View </span>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HubCard;