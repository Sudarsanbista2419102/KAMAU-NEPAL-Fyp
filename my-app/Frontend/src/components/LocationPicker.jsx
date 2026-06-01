import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair } from 'lucide-react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && map) {
      try {
        // Ensure map is fully initialized before calling setView
        if (map._container && map._container.offsetHeight > 0) {
          map.setView(position, map.getZoom ? map.getZoom() : 13, { animate: true });
        } else {
          // If map container not ready, retry after delay
          setTimeout(() => {
            if (map && map._container && map._container.offsetHeight > 0) {
              map.setView(position, map.getZoom ? map.getZoom() : 13, { animate: true });
            }
          }, 200);
        }
      } catch (error) {
        console.error('Map view error:', error);
      }
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || [27.7172, 85.3240]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (onLocationSelect && position) {
      onLocationSelect({
        lat: position[0],
        lng: position[1]
      });
    }
  }, [position, onLocationSelect]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setIsLocating(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          alert("Could not get your current location. Please select it on the map manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
          Pin Your Location
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Crosshair size={14} />
          )}
          {isLocating ? 'Locating...' : 'Get Current'}
        </button>
      </div>

      <div className="h-64 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <RecenterMap position={position} />
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <MapPin size={12} className="text-emerald-500" />
            <span>Click map to pin work area</span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 font-medium italic">
        * This helps the professional find your exact workplace for better service.
      </p>
    </div>
  );
};

export default LocationPicker;
