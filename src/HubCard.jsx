import React, { useState } from "react";
import Print from "./assets/Print.png"
import Modal2 from "./Modal2"
const HubCard = ({ hub }) => {
    const [Isopen, setisopen] = useState(false)
    const onSeeDetails = () => {


    }

    return (

        <div className="max-w-sm mx-auto lg:w-[280px] w-[100%]">
       {Isopen ? <Modal2 setisopen={setisopen} hub={hub} /> : null} 
        
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          <div className="p-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {hub.status}
              </span>
            </div>
  
            {/* Printer Image */}
            <div className="flex flex-col items-center mb-2 bg-[#f5f5f5] rounded-xl">
              <img 
                src={Print} 
                alt={hub.name}
                className="h-[150px] mb-3 object-fill"
              />
            </div>
  
            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">{hub.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {hub.address}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-yellow-400 mr-1">★</span>
                <span>{hub.rating}</span>
                <span className="text-gray-400 ml-1">({hub.reviews} Reviews)</span>
              </div>
            </div>
  
            {/* Action Button */}
            <button
              onClick={() => setisopen(true)}
              className="w-full mt-4 bg-teal-400 text-white py-2 px-4 rounded-md hover:bg-teal-500 transition-colors"
            >
              See Details
            </button>
          </div>
        </div>
      </div>


        // <div className="hub-card">
        //   <img src={Print} alt={hub.name} className="hub-image" />
        //   <h3>{hub.name}</h3>
        //   <p>{hub.address}</p>
        //   <p>
        //     <strong>Rating:</strong> {hub.rating} ★
        //   </p>
        //   <button className="details-btn">See Details</button>


        // </div>
    );
};

export default HubCard;
