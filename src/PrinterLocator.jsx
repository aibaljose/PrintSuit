import React, { useState, useEffect } from "react";
import HubCard from "./HubCard";
import Map from "./Map";
import Nav from "./nav";
import Print from "./assets/color.png"
import loc from "./assets/loc.png"
import {
  Ruler,
  Printer,
  FileText,
  ChevronDown
} from 'lucide-react';
import { db, collection, getDocs, addDoc,getDoc, doc, updateDoc, deleteDoc } from "./component/firebase";




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

const PrinterLocator = () => {
  const [hubs, setHub] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [filteredHubs, setFilteredHubs] = useState(hubs);
  const [range, setRange] = useState(10);
  const [locationInput, setLocationInput] = useState("");
  const [filters, setFilters] = useState({ type: "", paperSize: "" });
  const [loading, setLoading] = useState(false);

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
    const fetchAndFilterHubs = async () => {
      if (hubs.length === 0) {
        await fetchPrinterHubs(); // Only fetch if hubs are empty
      }
      
      let filtered = [...hubs]; // Create a copy to avoid direct mutation
  
      // Ensure userLocation has valid values
      if (userLocation?.lat && userLocation?.lng) {
        filtered = filtered.filter((hub) => 
          hub.location[0] &&
          hub.location[1]&&
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
  }, [hubs,userLocation, range, filters]); // 🔥 Removed `hubs` from dependencies
   // Include hubs as a dependency
  

  return (
    <div className="printerloc  bg-gray-50 min-h-screen ">
      <Nav />

      <div className="flex flex-col gap-6 px-10 pt-8 ">
        <div className="flex mt-[80px] flex-wrap gap-4 items-center justify-between  p-6 outline outline-1 -outline-offset-1 outline-gray-300 rounded-lg">
          {/* Location Input */}
          <div className="flex items-center w-full md:w-1/3 ">
            <input
              type="text"
              placeholder="Enter a location"
              className="   block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <button
              onClick={handleCurrentLocation}
              className="px-4 py-2 text-white rounded-md  active:bg-blue-700"
            >
              <img src={loc} height="30px" width="30px" alt="" />
            </button>
            <button
              onClick={handleLocationSearch}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Current Location Button */}

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Ruler className="text-gray-600" />
              <label className="font-medium text-gray-700">Range (km):</label>
              <input
                type="number"
                className="w-20 pl-2 py-1 border rounded-md outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                min="1"
              />
            </div>

            <div className="relative">
              <Printer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
              <select
                className="pl-10 pr-8 py-2 border rounded-md outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-none focus:ring focus:ring-blue-300 appearance-none"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Printer Types</option>
                <option value="Color">Color</option>
                <option value="Black & White">Black & White</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
          
              <select
                className="pl-10 pr-8 py-2 border rounded-md outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-none focus:ring focus:ring-blue-300 appearance-none"
                value={filters.paperSize}
                onChange={(e) => setFilters({ ...filters, paperSize: e.target.value })}
              >
                <option value="">All Paper Sizes</option>
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="A5">A5</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-6 lg:flex-wrap w-[100%] flex-col-reverse lg:flex-row ">
          {/* Map Component */}


          {/* Results */}
          <div className="h-[100vh] lg:overflow-y-auto  p-2 ddnd ">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Nearby Printing Hubs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
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


          <div className="lg:w-[30%]  lg:h-[100vh] h-[400px] pt-[20px] rounded-lg lg:overflow-hidden shadow ">
            <Map hubs={filteredHubs} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrinterLocator;
