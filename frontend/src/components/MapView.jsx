import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMobility } from '../context/MobilityContext';

// Fixing default Leaflet marker icon asset imports in build toolchains
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    route: null,
    incidents: [],
    congestion: [],
    safetyGrid: [],
    startMarker: null,
    endMarker: null
  });

  const [mapStyle, setMapStyle] = useState("roadmap");

  const {
    currentLocation,
    selectedRouteOption,
    congestionHotspots,
    safetyHotspots,
    communityIncidents,
    activeTab,
    upvoteIncident,
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    snapToRoad,
    activeSafetyScore,
    setActiveSafetyScore,
    safetyScoreLoading,
    checkSafetyScore
  } = useMobility();

  // Reset safety score when route selection changes
  useEffect(() => {
    if (setActiveSafetyScore) {
      setActiveSafetyScore(null);
    }
  }, [selectedRouteOption, setActiveSafetyScore]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 13,
      zoomControl: false // custom position below
    });
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    mapInstanceRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 1b. Handle dynamic Google Maps style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let lyrs = 'm';
    if (mapStyle === 'satellite') lyrs = 's';
    else if (mapStyle === 'hybrid') lyrs = 'y';
    else if (mapStyle === 'terrain') lyrs = 'p';

    const tiles = L.tileLayer(`https://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`, {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20
    }).addTo(map);

    tileLayerRef.current = tiles;
  }, [mapStyle]);

  // 2. Center map on user location initially
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 13);
    }
  }, [currentLocation]);

  // 3. Draw Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing route layer
    if (layersRef.current.route) {
      map.removeLayer(layersRef.current.route);
      layersRef.current.route = null;
    }

    if (selectedRouteOption && selectedRouteOption.path && selectedRouteOption.path.length > 0) {
      const latlngs = selectedRouteOption.path.map(pt => [pt.lat, pt.lng]);
      
      // Select path color based on transportation mode or status
      let routeColor = "#5BC0BE"; // cyan/teal default
      if (selectedRouteOption.mode === "walking" || selectedRouteOption.mode === "bicycle") {
        routeColor = "#10B981"; // green
      } else if (selectedRouteOption.mode === "metro" || selectedRouteOption.mode === "train") {
        routeColor = "#3B82F6"; // blue
      } else if (selectedRouteOption.mode === "taxi" || selectedRouteOption.mode === "auto") {
        routeColor = "#F59E0B"; // yellow/orange
      }
      
      const polyline = L.polyline(latlngs, {
        color: routeColor,
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      layersRef.current.route = polyline;

      // Fit map bounds to show full route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [selectedRouteOption]);

  // 3b. Draw Start and End Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    if (layersRef.current.startMarker) {
      map.removeLayer(layersRef.current.startMarker);
      layersRef.current.startMarker = null;
    }
    if (layersRef.current.endMarker) {
      map.removeLayer(layersRef.current.endMarker);
      layersRef.current.endMarker = null;
    }

    // Draw Start Marker
    if (startPoint) {
      const pickupIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-brand-teal text-darkBg-deep border-2 border-white flex items-center justify-center font-bold text-xs shadow-lg shadow-black animate-pulse">📍</div>`,
        className: 'custom-pickup-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const startMarker = L.marker([startPoint.lat, startPoint.lng], {
        icon: pickupIcon,
        draggable: true
      }).addTo(map);

      startMarker.bindPopup(`
        <div style="padding: 4px; color: #cbd5e1; font-family: sans-serif;">
          <h4 style="font-weight: 700; color: #5BC0BE; margin: 0 0 2px 0; font-size: 12px;">Pickup Point</h4>
          <p style="margin: 0; font-size: 11px;">${startPoint.name}</p>
          <span style="font-size: 9px; color: #a1a1aa; font-style: italic;">Drag pin to adjust pickup</span>
        </div>
      `).openPopup();

      startMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const snapped = snapToRoad(pos.lat, pos.lng);
        setStartPoint({
          name: snapped.name,
          lat: snapped.lat,
          lng: snapped.lng,
          isSnapped: true
        });
      });

      layersRef.current.startMarker = startMarker;
    }

    // Draw End Marker
    if (endPoint) {
      const dropoffIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-brand-red text-white border-2 border-white flex items-center justify-center font-bold text-xs shadow-lg shadow-black">🏁</div>`,
        className: 'custom-dropoff-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const endMarker = L.marker([endPoint.lat, endPoint.lng], {
        icon: dropoffIcon,
        draggable: true
      }).addTo(map);

      endMarker.bindPopup(`
        <div style="padding: 4px; color: #cbd5e1; font-family: sans-serif;">
          <h4 style="font-weight: 700; color: #EF4444; margin: 0 0 2px 0; font-size: 12px;">Destination</h4>
          <p style="margin: 0; font-size: 11px;">${endPoint.name}</p>
          <span style="font-size: 9px; color: #a1a1aa; font-style: italic;">Drag pin to adjust destination</span>
        </div>
      `);

      endMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const snapped = snapToRoad(pos.lat, pos.lng);
        setEndPoint({
          name: snapped.name,
          lat: snapped.lat,
          lng: snapped.lng,
          isSnapped: true
        });
      });

      layersRef.current.endMarker = endMarker;
    }
  }, [startPoint, endPoint]);

  // 4. Render Congestion Hotspots (Circles) when in Traffic tab
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old congestion circles
    layersRef.current.congestion.forEach(c => map.removeLayer(c));
    layersRef.current.congestion = [];

    if (activeTab === "traffic" && congestionHotspots && congestionHotspots.length > 0) {
      congestionHotspots.forEach(zone => {
        const circle = L.circle([zone.latitude, zone.longitude], {
          radius: zone.radius_meters,
          fillColor: '#EF4444', // Red congestion
          fillOpacity: zone.congestion_level * 0.5,
          color: '#EF4444',
          weight: 1,
          opacity: 0.8
        }).addTo(map);

        circle.bindPopup(`
          <div style="padding: 4px;">
            <h4 style="font-weight: 700; color: #EF4444; margin-bottom: 2px;">${zone.name}</h4>
            <p style="margin: 0; font-size: 12px;"><b>Congestion:</b> ${Math.round(zone.congestion_level * 100)}%</p>
            <p style="margin: 0; font-size: 12px;"><b>Speed Flow:</b> ${zone.current_speed_kmh} / ${zone.speed_limit_kmh} km/h</p>
          </div>
        `);

        layersRef.current.congestion.push(circle);
      });
    }
  }, [congestionHotspots, activeTab]);

  // 5. Render Safety zones when in Safety tab
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old safety hotspots
    layersRef.current.safetyGrid.forEach(s => map.removeLayer(s));
    layersRef.current.safetyGrid = [];

    if (activeTab === "safety" && safetyHotspots && safetyHotspots.length > 0) {
      safetyHotspots.forEach(pt => {
        let riskColor = "#10B981"; // safe
        if (pt.risk_level === "High Risk") {
          riskColor = "#EF4444";
        } else if (pt.risk_level === "Moderate Risk") {
          riskColor = "#F59E0B";
        }

        const circle = L.circle([pt.latitude, pt.longitude], {
          radius: 200,
          fillColor: riskColor,
          fillOpacity: 0.2,
          color: riskColor,
          weight: 1.5,
          opacity: 0.6
        }).addTo(map);

        circle.bindPopup(`
          <div style="padding: 4px;">
            <h4 style="font-weight: 700; color: ${riskColor}; margin-bottom: 2px;">Safety Rating: ${pt.safety_score}/100</h4>
            <p style="margin: 0; font-size: 12px;"><b>Risk level:</b> ${pt.risk_level}</p>
            <p style="margin: 0; font-size: 12px;"><b>Lighting index:</b> ${pt.lighting_rating}/10</p>
            <p style="margin: 0; font-size: 12px;"><b>Crowd index:</b> ${pt.crowd_density}/10</p>
          </div>
        `);

        layersRef.current.safetyGrid.push(circle);
      });
    }
  }, [safetyHotspots, activeTab]);

  // 6. Draw community reported incident markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old incident markers
    layersRef.current.incidents.forEach(m => map.removeLayer(m));
    layersRef.current.incidents = [];

    if (communityIncidents && communityIncidents.length > 0) {
      communityIncidents.forEach(inc => {
        let markerColor = "#EF4444"; // default red
        if (inc.type === "Unsafe Area") markerColor = "#F59E0B"; // yellow
        if (inc.type === "Flooded Road") markerColor = "#3B82F6"; // blue
        if (inc.type === "Traffic Congestion") markerColor = "#10B981";

        // Creating custom HTML element marker
        const el = document.createElement('div');
        el.className = `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg shadow-black`;
        el.style.backgroundColor = markerColor;
        
        let emoji = "⚠️";
        if (inc.type === "Accident") emoji = "🚗";
        if (inc.type === "Unsafe Area") emoji = "🔦";
        if (inc.type === "Flooded Road") emoji = "🌊";
        if (inc.type === "Harassment") emoji = "❗";
        el.innerHTML = emoji;

        const customIcon = L.divIcon({
          html: el,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon }).addTo(map);

        // Bind interactive popup content with upvote support
        const popupDiv = document.createElement('div');
        popupDiv.style.padding = '6px';
        popupDiv.style.width = '180px';
        popupDiv.innerHTML = `
          <h4 style="font-weight: 700; color: ${markerColor}; margin-bottom: 2px;">${inc.type}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #cbd5e1;">${inc.description}</p>
          <div style="font-size: 11px; margin-bottom: 6px;">
            <b>Severity:</b> ${inc.severity}<br/>
            <b>Upvotes:</b> <span id="votes-${inc.id}">${inc.upvotes}</span> ${inc.is_verified ? '✅ Verified' : '⏳ Pending'}
          </div>
        `;

        const upvoteBtn = document.createElement('button');
        upvoteBtn.innerText = '👍 Support Report';
        upvoteBtn.style.width = '100%';
        upvoteBtn.style.padding = '4px 8px';
        upvoteBtn.style.backgroundColor = '#5BC0BE';
        upvoteBtn.style.color = '#0B132B';
        upvoteBtn.style.border = 'none';
        upvoteBtn.style.borderRadius = '4px';
        upvoteBtn.style.fontSize = '11px';
        upvoteBtn.style.fontWeight = '700';
        upvoteBtn.style.cursor = 'pointer';

        upvoteBtn.addEventListener('click', () => {
          upvoteIncident(inc.id);
          const val = document.getElementById(`votes-${inc.id}`);
          if (val) {
            val.innerText = parseInt(val.innerText) + 1;
          }
        });

        popupDiv.appendChild(upvoteBtn);
        marker.bindPopup(popupDiv);

        layersRef.current.incidents.push(marker);
      });
    }
  }, [communityIncidents]);

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-0 rounded-2xl overflow-hidden border border-darkBg-border shadow-glass shadow-black">
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Style Selector */}
      <div className="absolute top-4 right-4 z-20 flex gap-1 bg-darkBg-card/85 backdrop-blur-md border border-darkBg-border p-1 rounded-xl shadow-lg">
        {[
          { id: "roadmap", label: "Map" },
          { id: "satellite", label: "Satellite" },
          { id: "hybrid", label: "Hybrid" },
          { id: "terrain", label: "Terrain" }
        ].map((style) => (
          <button
            key={style.id}
            onClick={() => setMapStyle(style.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border-none ${
              mapStyle === style.id
                ? 'bg-brand-teal text-darkBg-deep font-bold'
                : 'bg-transparent text-slate-300 hover:text-slate-100'
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>

      {/* Floating Mode Overlay indicator */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-[#6FFFE9]/20 shadow-lg">
          <div className={`w-2.5 h-2.5 rounded-full ${activeTab === 'safety' ? 'bg-red-500 animate-pulse' : 'bg-brand-neonCyan animate-ping'}`} />
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
            Smart City Live Network Grid
          </span>
        </div>
      </div>
      
      {/* Dynamic Route Info Overlay */}
      {selectedRouteOption && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-[90%] pointer-events-auto">
          <div className="glass-panel p-4 rounded-2xl border border-brand-teal/30 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-darkBg-border pb-2">
              <span className="text-sm font-bold text-brand-neonCyan uppercase tracking-wide">
                Active Directions
              </span>
              <span className="text-xs bg-darkBg-deep px-2 py-0.5 rounded-md border border-darkBg-border text-slate-400 font-semibold">
                {selectedRouteOption.mode.toUpperCase()}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
              {selectedRouteOption.instructions.map((inst, index) => (
                <div key={index} className="flex gap-2 items-start text-xs text-slate-300">
                  <span className="text-brand-teal text-base leading-none">🧭</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            {/* Safety Score Check Button */}
            <button
              onClick={() => {
                if (selectedRouteOption?.path && selectedRouteOption.path.length > 0) {
                  const endNode = selectedRouteOption.path[selectedRouteOption.path.length - 1];
                  checkSafetyScore(endNode.lat, endNode.lng);
                } else {
                  checkSafetyScore(currentLocation.lat, currentLocation.lng);
                }
              }}
              disabled={safetyScoreLoading}
              className="mt-1 bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-neonCyan border border-brand-teal/40 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all duration-200 border-none flex items-center justify-center gap-1.5 shadow-glass"
            >
              <span>🛡️</span> {safetyScoreLoading ? "Analyzing Road Security..." : "Check Road Safety Score"}
            </button>

            {/* Safety Score Detailed Panel */}
            {activeSafetyScore && (
              <div className="mt-2 p-3 bg-darkBg-deep/95 border border-brand-teal/35 rounded-xl flex flex-col gap-1.5 text-[11px] text-slate-300 relative animate-fade-in">
                <button
                  type="button"
                  onClick={() => setActiveSafetyScore(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-1">
                    🛡️ Road Safety: 
                    <b className={
                      activeSafetyScore.safety_score > 80 
                        ? 'text-emerald-400' 
                        : activeSafetyScore.safety_score > 50 
                          ? 'text-yellow-500' 
                          : 'text-brand-red'
                    }>
                      {activeSafetyScore.safety_score}/100
                    </b>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    activeSafetyScore.risk_level === 'Safe' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : activeSafetyScore.risk_level === 'Moderate Risk'
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'bg-red-500/10 text-brand-red border border-red-500/20'
                  }`}>
                    {activeSafetyScore.risk_level}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] mt-1 text-slate-400">
                  <div className="bg-darkBg-card/50 p-1.5 rounded border border-darkBg-border/40 text-center">
                    <span>💡 Lighting</span>
                    <b className="block text-slate-200 mt-0.5">{activeSafetyScore.lighting_rating}/10</b>
                  </div>
                  <div className="bg-darkBg-card/50 p-1.5 rounded border border-darkBg-border/40 text-center">
                    <span>👥 Crowd</span>
                    <b className="block text-slate-200 mt-0.5">{activeSafetyScore.crowd_density}/10</b>
                  </div>
                  <div className="bg-darkBg-card/50 p-1.5 rounded border border-darkBg-border/40 text-center">
                    <span>⚠️ Crime Ind.</span>
                    <b className="block text-slate-200 mt-0.5">{activeSafetyScore.crime_rate_index}/10</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
