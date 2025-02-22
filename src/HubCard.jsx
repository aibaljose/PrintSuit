import React, { useState } from "react";
import { MapPin, Star, ChevronRight, CircleDot } from "lucide-react";
import Modal2 from "./Modal2";
import printer from "./assets/color.png";

const HubCard = ({ hub }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-sm  mx-auto">
      {isOpen && <Modal2 setisopen={setIsOpen} hub={hub} />}
      
      <div className=" group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <CircleDot className="w-4 h-4 text-emerald-500"  />
            <span className="text-sm font-medium text-emerald-700">{hub.status}</span>
          </div>
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
                     hover:bg-gray-800 active:bg-gray-900 transition-colors duration-200"
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