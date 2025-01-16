import React, { useState, useEffect } from "react";
import HubCard from "./HubCard";
import Map from "./Map";
import Print from "./assets/printer.png";
import Nav from "./nav";
import { auth } from "./component/firebase";


const hubs = [
    {
        id: 1,
        name: "Tech Park Hub",
        address: "123 Tech Park Road",
        location: { lat: 9.546484, lng: 76.816818 },
        rating: 4.8,
        type: "Color",
        paperSize: "A4",
        speed: "30 ppm",
        image: Print,
      },
      {
        id: 2,
        name: "Downtown Hub",
        address: "456 Downtown Avenue",
        location: { lat: 9.772191, lng: 76.707253 },
        rating: 4.5,
        type: "Black & White",
        paperSize: "A3",
        speed: "20 ppm",
        image: Print,
      },
      {
        id: 3,
        name: "City Center Hub",
        address: "789 City Center",
        location: { lat: 9.931233, lng: 76.267303 },
        rating: 4.2,
        type: "Color",
        paperSize: "A4",
        speed: "25 ppm",
        image: Print,
      },
      {
        id: 4,
        name: "Metro Hub",
        address: "101 Metro Road",
        location: { lat: 10.0154, lng: 76.3419 },
        rating: 4.7,
        type: "Color",
        paperSize: "A3",
        speed: "35 ppm",
        image: Print,
      },
      {
        id: 5,
        name: "Town Square Hub",
        address: "102 Town Square",
        location: { lat: 10.0889, lng: 76.3532 },
        rating: 4.6,
        type: "Black & White",
        paperSize: "A4",
        speed: "18 ppm",
        image: Print,
      },
      {
        id: 6,
        name: "Green Park Hub",
        address: "103 Green Park",
        location: { lat: 9.9755, lng: 76.3123 },
        rating: 4.4,
        type: "Color",
        paperSize: "A5",
        speed: "28 ppm",
        image: Print,
      },
      {
        id: 7,
        name: "Mall Hub",
        address: "104 Mall Avenue",
        location: { lat: 10.0025, lng: 76.2456 },
        rating: 4.3,
        type: "Color",
        paperSize: "A4",
        speed: "22 ppm",
        image: Print,
      },
      {
        id: 8,
        name: "Central Hub",
        address: "105 Central Road",
        location: { lat: 9.9567, lng: 76.2901 },
        rating: 4.9,
        type: "Black & White",
        paperSize: "A3",
        speed: "26 ppm",
        image: Print,
      },
      {
        id: 9,
        name: "Harbor Hub",
        address: "106 Harbor Street",
        location: { lat: 9.9416, lng: 76.2582 },
        rating: 4.1,
        type: "Color",
        paperSize: "A4",
        speed: "24 ppm",
        image: Print,
      },
      {
        id: 10,
        name: "Bridge Hub",
        address: "107 Bridge Lane",
        location: { lat: 9.9485, lng: 76.2796 },
        rating: 4.7,
        type: "Color",
        paperSize: "A5",
        speed: "30 ppm",
        image: Print,
      },
      {
        id: 11,
        name: "River View Hub",
        address: "108 River View",
        location: { lat: 9.9424, lng: 76.2542 },
        rating: 4.5,
        type: "Black & White",
        paperSize: "A4",
        speed: "20 ppm",
        image: Print,
      },
      {
        id: 12,
        name: "Beach Hub",
        address: "109 Beach Road",
        location: { lat: 10.0287, lng: 76.2123 },
        rating: 4.3,
        type: "Color",
        paperSize: "A4",
        speed: "26 ppm",
        image: Print,
      },
      {
        id: 13,
        name: "Hilltop Hub",
        address: "110 Hilltop Lane",
        location: { lat: 10.0678, lng: 76.3112 },
        rating: 4.6,
        type: "Black & White",
        paperSize: "A5",
        speed: "18 ppm",
        image: Print,
      },
      {
        id: 14,
        name: "Forest Hub",
        address: "111 Forest Road",
        location: { lat: 10.0123, lng: 76.3412 },
        rating: 4.8,
        type: "Color",
        paperSize: "A3",
        speed: "32 ppm",
        image: Print,
      },
      {
        id: 15,
        name: "Sunset Hub",
        address: "112 Sunset Drive",
        location: { lat: 10.0912, lng: 76.3821 },
        rating: 4.7,
        type: "Color",
        paperSize: "A4",
        speed: "28 ppm",
        image: Print,
      },
      {
        id: 16,
        name: "Airport Hub",
        address: "113 Airport Road",
        location: { lat: 9.9547, lng: 76.2735 },
        rating: 4.4,
        type: "Black & White",
        paperSize: "A4",
        speed: "22 ppm",
        image: Print,
      },
      {
        id: 17,
        name: "Highway Hub",
        address: "114 Highway Lane",
        location: { lat: 9.9365, lng: 76.3210 },
        rating: 4.3,
        type: "Color",
        paperSize: "A5",
        speed: "25 ppm",
        image: Print,
      },
      {
        id: 18,
        name: "City Hub",
        address: "115 City Drive",
        location: { lat: 9.9432, lng: 76.2743 },
        rating: 4.9,
        type: "Color",
        paperSize: "A3",
        speed: "35 ppm",
        image: Print,
      },
      {
        id: 19,
        name: "Market Hub",
        address: "116 Market Street",
        location: { lat: 9.9267, lng: 76.2619 },
        rating: 4.2,
        type: "Black & White",
        paperSize: "A4",
        speed: "19 ppm",
        image: Print,
      },
      {
        id: 20,
        name: "Square Hub",
        address: "117 Square Avenue",
        location: { lat: 9.9112, lng: 76.2908 },
        rating: 4.6,
        type: "Color",
        paperSize: "A4",
        speed: "27 ppm",
        image: Print,
      },
 
];

// Haversine Formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; //
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const PrinterLocator = () => {
  const [userLocation, setUserLocation] = useState(null); 
  const [filteredHubs, setFilteredHubs] = useState(hubs); 
  const [range, setRange] = useState(10); 
  const [filters, setFilters] = useState({ search: "", type: "", paperSize: "" });

 
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error.message);
          setUserLocation(null);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  
  useEffect(() => {
    let filtered = hubs;

    
    if (userLocation) {
      filtered = filtered.filter((hub) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hub.location.lat,
          hub.location.lng
        );
        return distance <= range;
      });
    }

 
    if (filters.search) {
      filtered = filtered.filter((hub) =>
        hub.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

  
    if (filters.type) {
      filtered = filtered.filter((hub) => hub.type === filters.type);
    }


    if (filters.paperSize) {
      filtered = filtered.filter((hub) => hub.paperSize === filters.paperSize);
    }

    setFilteredHubs(filtered);
  }, [userLocation, range, filters]);

  return (
    <div className="printerloc bg-gray-50 min-h-screen">
      <Nav />
      <div className="flex flex-col gap-6 px-10 pt-8">
      
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 shadow rounded-lg">
         
          <div className="flex items-center w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name"
              className="w-full px-4 py-2 border rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

         
          <select
            className="px-4 py-2 border rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Printer Types</option>
            <option value="Color">Color</option>
            <option value="Black & White">Black & White</option>
          </select>

    
          <select
            className="px-4 py-2 border rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
            value={filters.paperSize}
            onChange={(e) => setFilters({ ...filters, paperSize: e.target.value })}
          >
            <option value="">All Paper Sizes</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>

    
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Range (km):</label>
            <input
              type="number"
              className="w-20 px-4 py-2 border rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              min="1"
            />
          </div>
        </div>

    
        <div className="w-full h-[300x] rounded-lg overflow-hidden shadow">
          <Map hubs={filteredHubs} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Nearby Printing Hubs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredHubs.length > 0 ? (
              filteredHubs.map((hub) => <HubCard key={hub.id} hub={hub} />)
            ) : (
              <p className="text-gray-500">No hubs found matching your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterLocator;
