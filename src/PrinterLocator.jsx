import React, { useState, useEffect } from "react";
import HubCard from "./HubCard";
import Map from "./Map";
import Nav from "./nav";
import Print from "./assets/color.png"
import loc from "./assets/loc.png"
import Printani from './assets/printanimate.svg'
import {
  Ruler,
  Printer,
  FileText,
  ChevronDown,
  Menu
} from 'lucide-react';
import { db, collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc } from "./component/firebase";




const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const places = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod", "Kanjirappally", "Chengannur", "Mavelikara",
  "Pala", "Thodupuzha", "Munnar", "Perumbavoor", "Angamaly", "Aluva", "Kochi"
];

const PrinterLocator = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [hubs, setHub] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [filteredHubs, setFilteredHubs] = useState(hubs);
  const [range, setRange] = useState(10);
  const [locationInput, setLocationInput] = useState("");
  const [filters, setFilters] = useState({ type: "", paperSize: "" });
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(true);



  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    
  

    if (!value.trim()) {
      setFilteredOptions([]);
      setShowDropdown(false);
      return;
    }

    // Filter places based on input (case-insensitive)
    const filtered1 = places.filter((place) =>
      place.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredOptions(filtered1);
    setShowDropdown(filtered1.length > 0);
  };

  










  const geocodeLocation = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyAzRiCqyt3irzVZr1n2W-hf4EMrFpGgdss`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return location;
      } else {
        throw new Error(data.status || "Failed to geocode location");
      }
    } catch (error) {
      console.error("Error fetching geocode:", error.message);
      return null;
    }
  };
  const fetchPrinterHubs = async () => {
    try {
      const hubsCollection = collection(db, "printerhubs");
      const querySnapshot = await getDocs(hubsCollection);

      const hubsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHub(hubsList);
    } catch (error) {
      console.error("Error fetching printer hubs:", error);
    }
  };
  const handleLocationSearch = async () => {
    setLoading(true);
    const geocodedLocation = await geocodeLocation(locationInput);
    if (geocodedLocation) {
      setUserLocation({
        lat: geocodedLocation.lat,
        lng: geocodedLocation.lng,
      });
    } else {
      setUserLocation(null);
      setFilteredHubs([]); // Clear results if geocoding fails
    }
    setLoading(false);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationInput(userLocation.lat,userLocation.lng);
        },
        (error) => {
          console.error("Error fetching current location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };
  useEffect(() => {
    setTimeout(() => setLoading1(false), 3000);
    const fetchAndFilterHubs = async () => {
      if (hubs.length === 0) {
        await fetchPrinterHubs(); // Only fetch if hubs are empty
      }

      let filtered = [...hubs]; // Create a copy to avoid direct mutation

      // Ensure userLocation has valid values
      if (userLocation?.lat && userLocation?.lng) {
        filtered = filtered.filter((hub) =>
          hub.location[0] &&
          hub.location[1] &&
          calculateDistance(userLocation.lat, userLocation.lng, hub.location[0], hub.location[1]) <= range
        );
      }

      // Apply additional filters
      if (filters.type) {
        filtered = filtered.filter((hub) => hub.type === filters.type);
      }

      if (filters.paperSize) {
        filtered = filtered.filter((hub) => hub.paperSize === filters.paperSize);
      }

      // Only update state if the filtered hubs changed
      if (JSON.stringify(filtered) !== JSON.stringify(filteredHubs)) {
        setFilteredHubs(filtered);
      }
    };

    fetchAndFilterHubs();
  }, [hubs, userLocation, range, filters]); // 🔥 Removed `hubs` from dependencies
  // Include hubs as a dependency

  if (loading1) {
    return (<div className="flex items-center justify-center h-[100vh] "> <Nav className="z-50" /><img src={Printani} alt="" height="400px" width="400px" /></div>)
  } else {
    const options = ["kanjirappally", "kottyam", "Option 3"];

    const handleSelect = (place) => {
   
      setLocationInput(place);

      

    
      setShowDropdown(false);
      
    };
    return (
      <div className="printerloc  bg-[#f1f5f9] min-h-screen animate-fadeIn">
        <Nav className="z-50" />

        <div className="flex flex-col gap-6 px-10 pt-3 mt-20 ">


          <div className=" p-6 bg-white rounded-md  border border-gray-100/80 w-full mx-auto">

            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search Bar Section */}
              <div className="w-full  flex  items-center gap-3">
              <div className="relative ">
        <input
          type="text"
          placeholder="Enter a location..."
          className="w-[320px] rounded-full bg-gray-50 px-5 py-3.5 text-base text-gray-900 
            border border-gray-200 placeholder:text-gray-400 shadow-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            transition-all duration-300 ease-in-out"
          value={locationInput}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
            handleLocationSearch();
          }}
          
        />

        {/* Custom Dropdown List */}
        {showDropdown && (
          <ul className="absolute  mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto z-10">
            {filteredOptions.map((place, index) => (
              <li
                key={index}
                className="p-3 cursor-pointer hover:bg-indigo-500 hover:text-white transition duration-200"
                onMouseDown={() => handleSelect(place)}
              >
                {place}
              </li>
            ))}
          </ul>
        )}
      </div>
                <button
                  onClick={handleCurrentLocation}
                  className="p-3 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 
              shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label="Use current location"
                >
                  <img src={loc} height="24px" width="24px" alt="Current Location" />
                </button>
                <button
                  onClick={handleLocationSearch}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold
              hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Filters Section */}
              <div className="w-full lg:w-3/5 flex flex-col gap-4">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Filters</span>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Menu className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Filter Inputs */}
                <div
                  className={`flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 ${isFilterOpen ? "block" : "hidden lg:flex"
                    }`}
                >
                  {/* Range Input */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Ruler className="text-gray-500 h-5 w-5" />
                    <label className="font-semibold text-gray-700 whitespace-nowrap">
                      Range (km):
                    </label>
                    <input
                      type="number"
                      className="w-24 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-200 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  transition-all duration-300"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* Printer Type Select */}
                  <div className="relative w-full sm:w-48">
                    <Printer className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <select
                      className="w-full pl-12 pr-10 py-2.5 bg-gray-50 rounded-full border border-gray-200 
                  shadow-sm appearance-none cursor-pointer font-medium text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  transition-all duration-300"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="">All Printer Types</option>
                      <option value="Color">Color</option>
                      <option value="Black & White">Black & White</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 pointer-events-none" />
                  </div>

                  {/* Paper Size Select */}
                  <div className="relative w-full sm:w-48">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <select
                      className="w-full pl-12 pr-10 py-2.5 bg-gray-50 rounded-full border border-gray-200 
                  shadow-sm appearance-none cursor-pointer font-medium text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  transition-all duration-300"
                      value={filters.paperSize}
                      onChange={(e) => setFilters({ ...filters, paperSize: e.target.value })}
                    >
                      <option value="">All Paper Sizes</option>
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex  lg:flex-wrap w-[100%] flex-col-reverse lg:flex-row justify-around ">
            {/* Map Component */}


            {/* Results */}
            <div className="h-[100vh] lg:overflow-y-auto  p-2 ddnd ">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Nearby Printing Hubs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 justify-between w-full  ">
                {filteredHubs.length > 0 ? (
                  filteredHubs.map((hub) => <HubCard key={hub.id} hub={hub} />,
                    console.log("zsdf")

                  )

                ) : (
                  <p className="text-gray-500 col-span-full text-center">
                    No hubs found matching your filters.
                  </p>
                )}
              </div>
            </div>


            <div className="lg:w-[35%]  lg:h-[100vh] h-[400px] pt-[20px] rounded-lg lg:overflow-hidden shadow ">
              <Map hubs={filteredHubs} />
            </div>
          </div>

        </div>
      </div>
    );
  }
};

export default PrinterLocator;
