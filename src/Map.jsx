import React from "react";
import { GoogleMap, useJsApiLoader,MarkerF } from "@react-google-maps/api";
import pointer from "./assets/pointer.png"
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "20px"
};

const libraries = ["places"];

const mapOptions = {
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ]
  
};

const Map = ({ hubs }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAzRiCqyt3irzVZr1n2W-hf4EMrFpGgdss",
    libraries,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      
      center={
        hubs.length > 0
          ? { lat: hubs[0].location[0], lng: hubs[0].location[1] }
          : { lat: 10.8505, lng: 76.2711 } // Default location
      }
      zoom={10}
      options={mapOptions} // Apply custom styles here
    >
      {/* Add your markers */}
      {hubs.map((hub, index) => (
        
        <MarkerF
          key={index}
          position={{ lat: hub.location[0], lng: hub.location[1] }} // Assuming 'lat' and 'lng' are in 'hubs'
          icon={{
            url: pointer, // Ensure 'pointer' is a valid image URL or import
            scaledSize: new window.google.maps.Size(30, 30), // Adjust width & height
          }}
        />
        

        
      ))}
    </GoogleMap>
  );
};

export default Map;
