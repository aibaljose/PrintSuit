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
  Menu, MapPin
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
          setLocationInput(userLocation.lat, userLocation.lng);
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
      <div className="printerloc bg-[#f1f5f9] min-h-screen">
        <Nav className="z-50" />

        <div className="flex flex-col gap-6 px-4 md:px-8 lg:px-10 pt-3 mt-20 pb-6">
          {/* Search and Filter Container */}
          <div className="bg-white lg:flex lg:flex-row lg:gap-4 item-center justify-center rounded-xl shadow-lg border border-gray-100/80 overflow-hidden ">
            {/* Search Section */}
            <div className="p-2 md:p-6 border-b border-gray-100 flex items-center w-[80%]">
              <div className="flex w-[80%] flex-col md:flex-row gap-4">
                <div className="flex gap-2 w-full relative">
                  <div className="relative w-full flex items-center">
                    <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search location..."
                      className="w-full rounded-xl bg-gray-50/50 pl-12 pr-4 py-3.5 text-gray-900 
                      border border-gray-200 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                      transition-all duration-300"
                      value={locationInput}
                      onChange={handleInputChange}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowDropdown(false), 200);
                        handleLocationSearch();
                      }}
                    />
                  </div>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                  <ul className="absolute w-full bg-white border border-gray-100 rounded-xl shadow-xl 
                  max-h-60 overflow-y-auto z-50 top-0 left-0 right-0 backdrop-blur-sm"
        style={{ 
          top: "calc(100% + 5px)"
        }}>
                      {filteredOptions.map((place, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors
                          text-gray-700 hover:text-indigo-600"
                          onMouseDown={() => handleSelect(place)}
                        >
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          {place}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={handleCurrentLocation}
                    className="group relative px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                    hover:bg-gray-100 hover:border-indigo-300 hover:shadow-md
                    transition-all duration-300"
                    aria-label="Use current location"
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Use current location
                    </span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">

                  {/* <button
                    onClick={handleLocationSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium
                    hover:bg-indigo-700 active:bg-indigo-800 
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2 min-w-[120px] justify-center shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Searching</span>
                      </>
                    ) : (
                      <>
                        <span>Search</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button> */}
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex gap-8 p-4 ">
              {/* Range Slider */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700 flex items-center">
                    <MapPin className="text-indigo-500 h-4 w-4 mr-1" />
                    Distance
                  </label>
                  <span className="text-xs text-gray-600">{range} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Printer Type */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <Printer className="text-indigo-500 h-4 w-4 mr-1" />
                  <label className="text-xs font-medium text-gray-700">Printer Type</label>
                </div>
                <select
                  className="w-full text-xs rounded bg-gray-50 border border-gray-200 px-2 py-1.5 text-gray-700"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="Color">Color</option>
                  <option value="Black & White">Black & White</option>
                </select>
              </div>

              {/* Paper Size */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <FileText className="text-indigo-500 h-4 w-4 mr-1" />
                  <label className="text-xs font-medium text-gray-700">Paper Size</label>
                </div>
                <select
                  className="w-full text-xs rounded bg-gray-50 border border-gray-200 px-2 py-1.5 text-gray-700"
                  value={filters.paperSize}
                  onChange={(e) => setFilters({ ...filters, paperSize: e.target.value })}
                >
                  <option value="">All Sizes</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="A5">A5</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex  flex-col-reverse lg:flex-row gap-6 h-full lg:h-[100vh] pb-[100px] w-full">
            {/* Results Section - Updated with proper height and overflow */}
            <div className="flex-1 h-full overflow-hidden ">
              <div className="bg-white rounded-lg shadow p-4 h-full ">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Nearby Printing Hubs
                </h2>
                {/* Scrollable container for cards */}
                <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-hide">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    {filteredHubs.length > 0 ? (
                      filteredHubs.map((hub) => (
                        <HubCard key={hub.id} hub={hub} />
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-full text-center">
                        No hubs found matching your filters.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section - Updated with proper height */}
            <div className="lg:w-[35%] h-[400px] lg:h-full rounded-lg overflow-hidden shadow-lg">
              <Map hubs={filteredHubs} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PrinterLocator;




