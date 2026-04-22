"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Heart, Star, Navigation, X } from "lucide-react";

export default function GoogleMapLoader({ posts, onPinClick, selectedPin }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Style "Warm & Elegant" pour la carte
  const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#ffdfd9" }] }, // Couleur eau corail très douce
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
  ];

  useEffect(() => {
    const loadMap = () => {
      if (typeof window.google === 'undefined') return;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 48.8566, lng: 2.3522 },
        zoom: 4,
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy"
      });

      setMap(googleMap);
    };

    if (window.google) {
      loadMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`;
      script.async = true;
      script.defer = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!map || !posts) return;

    // Clear existing markers
    markers.forEach(m => m.setMap(null));

    const newMarkers = posts.map(post => {
      const marker = new window.google.maps.Marker({
        position: { lat: post.lat, lng: post.lng },
        map: map,
        title: post.locationName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: post.locationType === 'wishlist' ? '#3b82f6' : '#ff7e67',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 10
        }
      });

      marker.addListener("click", () => onPinClick(post));
      return marker;
    });

    setMarkers(newMarkers);
  }, [map, posts]);

  useEffect(() => {
    if (map && selectedPin) {
      map.panTo({ lat: selectedPin.lat, lng: selectedPin.lng });
      map.setZoom(12);
    }
  }, [selectedPin]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-12 text-center pointer-events-none">
          <div className="glass-heavy p-8 rounded-3xl border-white/20">
            <MapPin size={48} className="mx-auto mb-4 text-[var(--accent-color)]" />
            <h3 className="text-xl font-bold mb-2">Google Maps Premium</h3>
            <p className="text-secondary text-sm">Please add your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see the real map.</p>
          </div>
        </div>
      )}
    </div>
  );
}
