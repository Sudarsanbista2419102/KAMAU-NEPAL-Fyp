import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, User, Phone, ExternalLink, Info, Activity, Plus, Minus, Route } from 'lucide-react';

// Polyline decoding helper for OSRM
const decodePolyline = (str, precision) => {
  let index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, lat_change, lng_change, factor = Math.pow(10, precision || 5);
  while (index < str.length) {
    byte = null; shift = 0; result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat_change = ((result & 1) ? ~(result >> 1) : (result >> 1)); lat += lat_change;
    byte = null; shift = 0; result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng_change = ((result & 1) ? ~(result >> 1) : (result >> 1)); lng += lng_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
};

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const customCustomerIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const customProfessionalIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  className: 'hue-rotate-[140deg]' 
});

const RoutePath = ({ start, end }) => {
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (!start || !end) return;
    const fetchRoute = async () => {
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=polyline`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const coords = decodePolyline(data.routes[0].geometry);
          setPath(coords);
        }
      } catch (error) {
        console.error("Routing error:", error);
      }
    };
    fetchRoute();
  }, [start, end]);

  return path.length > 0 ? <Polyline positions={path} color="#10b981" weight={5} opacity={0.8} dashArray="10, 10" /> : null;
};

// Helper component to center map on markers
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && map) {
      try {
        // Ensure map is fully initialized before calling setView
        if (map._container && map._container.offsetHeight > 0) {
          map.setView(center, map.getZoom ? map.getZoom() : 13, { animate: false });
        } else {
          // If map container not ready, retry after delay
          setTimeout(() => {
            if (map && map._container && map._container.offsetHeight > 0) {
              map.setView(center, map.getZoom ? map.getZoom() : 13, { animate: false });
            }
          }, 200);
        }
      } catch (error) {
        console.error('Map view error:', error);
      }
    }
  }, [center, map]);
  return null;
};

const CustomerMap = ({ bookings, professionalLocation }) => {
  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); 
  const [selectedRoute, setSelectedRoute] = useState(null); 
  const [zoom, setZoom] = useState(13);

  const validBookings = bookings.filter(b => 
    b.customerLocation && 
    b.customerLocation.coordinates && 
    b.customerLocation.coordinates.length === 2 &&
    (b.customerLocation.coordinates[0] !== 0 || b.customerLocation.coordinates[1] !== 0)
  );

  useEffect(() => {
    if (professionalLocation && professionalLocation.coordinates) {
      setMapCenter([professionalLocation.coordinates[1], professionalLocation.coordinates[0]]);
    } else if (validBookings.length > 0) {
      const first = validBookings[0].customerLocation.coordinates;
      setMapCenter([first[1], first[0]]);
    }
  }, [professionalLocation, validBookings]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Service Map</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Tracking {validBookings.length} Customers in real-time
          </p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
             <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" /> Customer
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
             <div className="w-2 h-2 bg-teal-600 rounded-full" /> YOU
           </div>
        </div>
      </div>

      <div className="h-[600px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap center={mapCenter} />

          {/* Route Path */}
          {selectedRoute && professionalLocation && (
            <RoutePath 
              start={[professionalLocation.coordinates[1], professionalLocation.coordinates[0]]} 
              end={selectedRoute} 
            />
          )}

          {/* Zoom Controls */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
            <button 
              onClick={() => {
                try {
                  setZoom(prev => Math.min(prev + 1, 18));
                } catch (error) {
                  console.error('Zoom error:', error);
                }
              }}
              className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => {
                try {
                  setZoom(prev => Math.max(prev - 1, 3));
                } catch (error) {
                  console.error('Zoom error:', error);
                }
              }}
              className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
            >
              <Minus size={20} />
            </button>
          </div>

          {/* Professional Marker */}
          {professionalLocation && professionalLocation.coordinates && (
            <Marker 
              position={[professionalLocation.coordinates[1], professionalLocation.coordinates[0]]}
              icon={customProfessionalIcon}
            >
              <Popup className="rounded-2xl">
                <div className="p-2">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Your HQ</p>
                  <p className="font-bold text-slate-900">Professional Signal</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Customer Markers */}
          {validBookings.map((booking) => {
            const [lng, lat] = booking.customerLocation.coordinates;
            const dist = professionalLocation ? calculateDistance(
              professionalLocation.coordinates[1], 
              professionalLocation.coordinates[0], 
              lat, lng
            ) : null;

            return (
              <Marker 
                key={booking._id} 
                position={[lat, lng]}
                icon={customCustomerIcon}
              >
                <Popup className="custom-popup rounded-3xl overflow-hidden">
                  <div className="p-4 space-y-4 min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{booking.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{booking.serviceTitle}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Navigation size={14} className="text-slate-400" />
                        <span>{dist ? `${dist} km away` : 'Calculating...'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button 
                        onClick={() => setSelectedRoute([lat, lng])}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                      >
                        <Route size={14} /> Show Shortest Way
                      </button>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
                      >
                        <ExternalLink size={14} /> Google Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {validBookings.length === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8 text-center">
            <div className="max-w-xs space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto animate-pulse">
                <Info size={32} />
              </div>
              <p className="text-white font-black text-xl tracking-tight">No Location Data Found</p>
              <p className="text-slate-300 text-xs font-medium leading-relaxed">
                We couldn't detect active customer signals. Geolocation data is captured during the booking request.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
               <MapPin size={20} />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your Base</p>
           </div>
           <p className="text-sm font-black text-slate-900">{professionalLocation?.coordinates ? "Signal Locked" : "Searching for HQ..."}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
               <Activity size={20} className="animate-bounce" />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Targets</p>
           </div>
           <p className="text-sm font-black text-slate-900">{validBookings.length} Active Points</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerMap;
