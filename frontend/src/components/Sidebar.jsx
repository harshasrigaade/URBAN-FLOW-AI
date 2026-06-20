import React, { useState, useEffect } from 'react';
import { useMobility } from '../context/MobilityContext';
import { 
  Navigation, TrafficCone, Shield, Leaf, IndianRupee, 
  Bell, AlertCircle, Bot, LogOut, Check, Sparkles, MapPin, 
  Activity, ShieldAlert, Award
} from 'lucide-react';

// Hardcoded landmark coordinate options matching NLP agent (Hyderabad, India)
// Hardcoded landmark coordinate options matching NLP agent (Hyderabad, India)
const PRESETS = [
  { name: "Current Location", lat: 17.3850, lng: 78.4867 },
  { name: "Home (Banjara Hills)", lat: 17.4138, lng: 78.4398 },
  { name: "Office (HITEC City)", lat: 17.4435, lng: 78.3772 },
  { name: "Rajiv Gandhi Int'l Airport", lat: 17.2403, lng: 78.4294 },
  { name: "Hussain Sagar Lake", lat: 17.4239, lng: 78.4738 },
  { name: "Osmania University", lat: 17.4137, lng: 78.5283 },
  { name: "Charminar (Downtown)", lat: 17.3616, lng: 78.4747 },
  { name: "Inorbit Mall (Shopping)", lat: 17.4330, lng: 78.3828 },
  
  // Red Line Metro Stations
  { name: "Miyapur Metro Station", lat: 17.4968, lng: 78.3725 },
  { name: "JNTU College Metro Station", lat: 17.4930, lng: 78.3916 },
  { name: "KPHB Colony Metro Station", lat: 17.4842, lng: 78.3986 },
  { name: "Kukatpally Metro Station", lat: 17.4725, lng: 78.4116 },
  { name: "Balanagar Metro Station", lat: 17.4690, lng: 78.4215 },
  { name: "Moosapet Metro Station", lat: 17.4635, lng: 78.4239 },
  { name: "Bharat Nagar Metro Station", lat: 17.4539, lng: 78.4235 },
  { name: "Erragadda Metro Station", lat: 17.4518, lng: 78.4278 },
  { name: "ESI Hospital Metro Station", lat: 17.4475, lng: 78.4325 },
  { name: "SR Nagar Metro Station", lat: 17.4431, lng: 78.4398 },
  { name: "Ameerpet Metro Station", lat: 17.4347, lng: 78.4484 },
  { name: "Punjagutta Metro Station", lat: 17.4265, lng: 78.4533 },
  { name: "Irrum Manzil Metro Station", lat: 17.4215, lng: 78.4578 },
  { name: "Khairatabad Metro Station", lat: 17.4128, lng: 78.4619 },
  { name: "Lakdikapul Metro Station", lat: 17.4042, lng: 78.4650 },
  { name: "Assembly Metro Station", lat: 17.3995, lng: 78.4715 },
  { name: "Nampally Metro Station", lat: 17.3919, lng: 78.4735 },
  { name: "Gandhi Bhavan Metro Station", lat: 17.3855, lng: 78.4755 },
  { name: "Osmania Medical College Metro Station", lat: 17.3812, lng: 78.4815 },
  { name: "MG Bus Station Metro Station (MGBS)", lat: 17.3732, lng: 78.4827 },
  { name: "Malakpet Metro Station", lat: 17.3695, lng: 78.4912 },
  { name: "New Market Metro Station", lat: 17.3692, lng: 78.5015 },
  { name: "Musarambagh Metro Station", lat: 17.3698, lng: 78.5135 },
  { name: "Dilsukhnagar Metro Station", lat: 17.3688, lng: 78.5285 },
  { name: "Chaitanyapuri Metro Station", lat: 17.3682, lng: 78.5398 },
  { name: "Victoria Memorial Metro Station", lat: 17.3658, lng: 78.5505 },
  { name: "LB Nagar Metro Station", lat: 17.3592, lng: 78.5559 },
  
  // Blue Line Metro Stations
  { name: "Raidurg Metro Station", lat: 17.4429, lng: 78.3770 },
  { name: "HITEC City Metro Station", lat: 17.4435, lng: 78.3820 },
  { name: "Durgam Cheruvu Metro Station", lat: 17.4428, lng: 78.3905 },
  { name: "Madhapur Metro Station", lat: 17.4395, lng: 78.4005 },
  { name: "Peddamma Gudi Metro Station", lat: 17.4355, lng: 78.4110 },
  { name: "Jubilee Hills Check Post Metro Station", lat: 17.4342, lng: 78.4210 },
  { name: "Road No. 5 Jubilee Hills Metro Station", lat: 17.4328, lng: 78.4298 },
  { name: "Yusufguda Metro Station", lat: 17.4345, lng: 78.4358 },
  { name: "Madhura Nagar Metro Station", lat: 17.4338, lng: 78.4418 },
  { name: "Begumpet Metro Station", lat: 17.4372, lng: 78.4595 },
  { name: "Prakash Nagar Metro Station", lat: 17.4385, lng: 78.4705 },
  { name: "Rasoolpura Metro Station", lat: 17.4402, lng: 78.4820 },
  { name: "Paradise Metro Station", lat: 17.4425, lng: 78.4905 },
  { name: "Parade Ground Metro Station", lat: 17.4445, lng: 78.4982 },
  { name: "Secunderabad East Metro Station", lat: 17.4428, lng: 78.5025 },
  { name: "Mettuguda Metro Station", lat: 17.4318, lng: 78.5205 },
  { name: "Tarnaka Metro Station", lat: 17.4285, lng: 78.5375 },
  { name: "Habsiguda Metro Station", lat: 17.4248, lng: 78.5505 },
  { name: "NGRI Metro Station", lat: 17.4195, lng: 78.5635 },
  { name: "Stadium Metro Station", lat: 17.4148, lng: 78.5705 },
  { name: "Uppal Metro Station", lat: 17.4085, lng: 78.5775 },
  { name: "Nagole Metro Station", lat: 17.4022, lng: 78.5835 },
  
  // Green Line Metro Stations
  { name: "JBS Parade Ground Metro Station", lat: 17.4445, lng: 78.4982 },
  { name: "Secunderabad West Metro Station", lat: 17.4405, lng: 78.4998 },
  { name: "Gandhi Hospital Metro Station", lat: 17.4295, lng: 78.5032 },
  { name: "Musheerabad Metro Station", lat: 17.4218, lng: 78.5050 },
  { name: "RTC X Roads Metro Station", lat: 17.4128, lng: 78.5042 },
  { name: "Chikkadpally Metro Station", lat: 17.4072, lng: 78.5055 },
  { name: "Narayanaguda Metro Station", lat: 17.3978, lng: 78.4962 },
  { name: "Sultan Bazaar Metro Station", lat: 17.3862, lng: 78.4935 }
];

export default function Sidebar({ onOpenChat }) {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    adminViewActive,
    setAdminViewActive,
    
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    
    routesData,
    selectedRouteOption,
    setSelectedRouteOption,
    routingPreference,
    setRoutingPreference,
    routingLoading,
    calculateRoute,
    systemAlerts,
    detectLocation,
    locatingStatus,
    locatingLog
  } = useMobility();

  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : ["Charminar (Downtown)", "Rajiv Gandhi Int'l Airport"];
  });

  useEffect(() => {
    if (startPoint) {
      setStartInput(startPoint.name);
    }
  }, [startPoint]);

  useEffect(() => {
    if (endPoint) {
      setEndInput(endPoint.name);
    }
  }, [endPoint]);

  const getFilteredSuggestions = (input) => {
    if (!input.trim()) return [];
    return PRESETS.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));
  };

  const selectDestination = (preset) => {
    setEndPoint(preset);
    setEndInput(preset.name);
    setShowEndSuggestions(false);
    
    if (!recentSearches.includes(preset.name)) {
      const updated = [preset.name, ...recentSearches.slice(0, 3)];
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  const selectStartPoint = (preset) => {
    setStartPoint(preset);
    setStartInput(preset.name);
    setShowStartSuggestions(false);
  };

  const handleRouteSearch = (e) => {
    e.preventDefault();
    
    // 1. Geocode Start Point
    let start = startPoint;
    if (startInput !== startPoint?.name) {
      const match = PRESETS.find(p => p.name.toLowerCase().includes(startInput.toLowerCase()));
      if (match) {
        start = match;
      } else {
        start = {
          name: startInput,
          lat: 17.3850 + (Math.random() - 0.5) * 0.05,
          lng: 78.4867 + (Math.random() - 0.5) * 0.05,
          isSnapped: true
        };
      }
      setStartPoint(start);
    }

    // 2. Geocode End Point (Destination)
    let end = endPoint;
    if (!end || endInput !== endPoint?.name) {
      const match = PRESETS.find(p => p.name.toLowerCase().includes(endInput.toLowerCase()));
      if (match) {
        end = match;
      } else {
        end = {
          name: endInput,
          lat: 17.3850 + (Math.random() - 0.5) * 0.05,
          lng: 78.4867 + (Math.random() - 0.5) * 0.05,
          isSnapped: true
        };
      }
      setEndPoint(end);
    }

    if (start && end) {
      calculateRoute(start, end, routingPreference);
      
      if (!recentSearches.includes(end.name)) {
        const updated = [end.name, ...recentSearches.slice(0, 3)];
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
      }
    }
  };

  const menuItems = [
    { id: "routes", label: "Route Planner", icon: Navigation, color: "text-brand-neonCyan" },
    { id: "traffic", label: "Traffic Prediction", icon: TrafficCone, color: "text-brand-neonCyan" },
    { id: "safety", label: "Safety Scorer", icon: Shield, color: "text-brand-neonCyan" },
    { id: "carbon", label: "Carbon Tracker", icon: Leaf, color: "text-brand-green" },
    { id: "cost", label: "Cost Optimizer", icon: IndianRupee, color: "text-brand-teal" },
    { id: "alerts", label: "Road Alerts", icon: Bell, color: "text-brand-red", badge: systemAlerts.length }
  ];

  return (
    <div className="w-full lg:w-96 glass-panel h-full flex flex-col justify-between overflow-y-auto shrink-0 border-r border-darkBg-border select-none">
      
      {/* 1. App logo section */}
      <div className="p-5 border-b border-darkBg-border flex flex-col gap-1 relative">
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-neonCyan/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            UrbanFlow AI
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-neonCyan border border-brand-teal/40 font-bold uppercase tracking-wider">
              AI Smart City
            </span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          AI-Powered Smart Commutes: Safer, Faster, Cheaper, Greener
        </p>
      </div>

      {/* 2. Mode Select Tabs */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        
        {/* Navigation list */}
        <div className="grid grid-cols-3 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "admin") setAdminViewActive(true);
                  else if (item.id !== "admin" && currentUser?.role !== "admin") setAdminViewActive(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer gap-1 transition-all duration-200 ${
                  active 
                    ? 'bg-brand-teal/15 border-brand-teal/50 shadow-glass' 
                    : 'bg-darkBg-card/40 border-darkBg-border/55 hover:border-brand-teal/30 hover:bg-darkBg-card/70'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[8px] font-bold px-1 rounded-full border border-darkBg-deep">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-semibold text-slate-300 tracking-wide text-center leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Side controls */}
        {activeTab === "routes" && (
          <div className="flex flex-col gap-3 mt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              🧭 Trip Navigation setup
            </h3>
            
            {/* Live Location Scan Status */}
            {locatingStatus === "locating" && (
              <div className="bg-brand-teal/5 border border-brand-teal/20 p-2.5 rounded-xl flex flex-col gap-1 text-[10px]">
                <span className="text-brand-neonCyan font-bold animate-pulse">📡 GPS CELLULAR TRIANGULATION SCANNING...</span>
                <span className="text-slate-400 leading-tight">{locatingLog}</span>
              </div>
            )}
            {locatingStatus === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex flex-col gap-0.5 text-[10px]">
                <span className="text-emerald-400 font-bold">✓ live location verified</span>
                <span className="text-slate-400 leading-tight">{locatingLog}</span>
              </div>
            )}

            <form onSubmit={handleRouteSearch} className="flex flex-col gap-3">
              {/* Pickup Point Input */}
              <div className="flex flex-col gap-1 relative">
                <label className="text-[9px] text-slate-400 font-semibold tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-teal" /> START / PICKUP</span>
                  {startPoint?.isSnapped && <span className="text-brand-teal text-[8px] font-bold">Snapped to road</span>}
                </label>
                <div className="flex gap-1.5">
                  <input
                    value={startInput}
                    onChange={(e) => {
                      setStartInput(e.target.value);
                      setShowStartSuggestions(true);
                    }}
                    onFocus={() => setShowStartSuggestions(true)}
                    type="text"
                    className="glass-input p-2.5 rounded-xl text-xs text-slate-200 flex-1"
                    placeholder="Enter pickup location..."
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    title="Detect Current Location (Simulated GPS/Wi-Fi/Cell)"
                    className="bg-brand-teal/15 hover:bg-brand-teal/30 text-brand-neonCyan border border-brand-teal/40 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                  >
                    🎯
                  </button>
                </div>

                {/* Pickup Autocomplete */}
                {showStartSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-30 bg-darkBg-card/95 border border-darkBg-border p-1.5 rounded-xl mt-1 max-h-[160px] overflow-y-auto shadow-2xl backdrop-blur-lg">
                    <div className="flex justify-between items-center px-1.5 py-1 border-b border-darkBg-border/50 mb-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Suggested Places</span>
                      <button type="button" onClick={() => setShowStartSuggestions(false)} className="text-[8px] text-brand-red border-none bg-transparent hover:underline font-bold">Close</button>
                    </div>
                    {PRESETS.filter(p => p.name.toLowerCase().includes(startInput.toLowerCase())).map((p, i) => (
                      <div
                        key={i}
                        onClick={() => selectStartPoint(p)}
                        className="p-2 text-xs text-slate-300 hover:text-white hover:bg-brand-teal/10 rounded-lg cursor-pointer flex items-center justify-between"
                      >
                        <span>📍 {p.name}</span>
                      </div>
                    ))}
                    {PRESETS.filter(p => p.name.toLowerCase().includes(startInput.toLowerCase())).length === 0 && (
                      <div className="p-2 text-[10px] text-slate-400 italic">No exact match found (press search to geocode).</div>
                    )}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="flex flex-col gap-1 relative">
                <label className="text-[9px] text-slate-400 font-semibold tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-red" /> DESTINATION / DROP-OFF</span>
                  {endPoint?.isSnapped && <span className="text-brand-teal text-[8px] font-bold">Snapped to road</span>}
                </label>
                <input
                  value={endInput}
                  onChange={(e) => {
                    setEndInput(e.target.value);
                    setShowEndSuggestions(true);
                  }}
                  onFocus={() => setShowEndSuggestions(true)}
                  type="text"
                  className="glass-input p-2.5 rounded-xl text-xs text-slate-200"
                  placeholder="Enter drop-off destination..."
                />

                {/* Destination Autocomplete */}
                {showEndSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-30 bg-darkBg-card/95 border border-darkBg-border p-1.5 rounded-xl mt-1 max-h-[220px] overflow-y-auto shadow-2xl backdrop-blur-lg">
                    <div className="flex justify-between items-center px-1.5 py-1 border-b border-darkBg-border/50 mb-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Search Results & Matches</span>
                      <button type="button" onClick={() => setShowEndSuggestions(false)} className="text-[8px] text-brand-red border-none bg-transparent hover:underline font-bold">Close</button>
                    </div>

                    {/* Landmark matches */}
                    {getFilteredSuggestions(endInput).map((p, i) => (
                      <div
                        key={i}
                        onClick={() => selectDestination(p)}
                        className="p-2 text-xs text-slate-300 hover:text-white hover:bg-brand-teal/10 rounded-lg cursor-pointer flex items-center justify-between font-semibold"
                      >
                        <span>🏁 {p.name}</span>
                        <span className="text-[8px] text-slate-500 font-bold">Landmark</span>
                      </div>
                    ))}

                    {/* Popular Places Suggestions (if typed text is short/empty) */}
                    {!endInput.trim() && (
                      <>
                        <div className="px-1.5 py-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">Popular Places</div>
                        {PRESETS.slice(1, 5).map((p, i) => (
                          <div
                            key={i}
                            onClick={() => selectDestination(p)}
                            className="p-2 text-xs text-slate-300 hover:text-white hover:bg-brand-teal/10 rounded-lg cursor-pointer"
                          >
                            ⭐ {p.name}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <>
                        <div className="px-1.5 py-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Recent Searches</div>
                        {recentSearches.map((term, i) => {
                          const preset = PRESETS.find(p => p.name === term) || { name: term, lat: 17.3850, lng: 78.4867 };
                          return (
                            <div
                              key={i}
                              onClick={() => selectDestination(preset)}
                              className="p-2 text-xs text-slate-300 hover:text-white hover:bg-brand-teal/10 rounded-lg cursor-pointer flex items-center justify-between"
                            >
                              <span>🕒 {term}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Preference selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-semibold tracking-wider">ROUTING PREFERENCE</label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: "balanced", emoji: "⚖️", label: "Balanced" },
                    { id: "fastest", emoji: "⚡", label: "Fastest" },
                    { id: "cheapest", emoji: "💵", label: "Cheapest" },
                    { id: "safest", emoji: "🛡️", label: "Safest" },
                    { id: "eco", emoji: "🌿", label: "Green" }
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setRoutingPreference(pref.id)}
                      title={pref.label}
                      className={`py-1.5 rounded-lg border text-xs cursor-pointer flex flex-col items-center justify-center transition-all ${
                        routingPreference === pref.id
                          ? 'bg-brand-teal text-darkBg-deep font-bold border-brand-teal'
                          : 'bg-slate-800/40 text-slate-300 border-darkBg-border'
                      }`}
                    >
                      <span>{pref.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={routingLoading}
                className="w-full bg-brand-teal hover:bg-brand-teal/80 text-darkBg-deep text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-all duration-200 border-none mt-1"
              >
                {routingLoading ? "Optimizing City Grid..." : "Search Routes"}
              </button>
            </form>

            {/* Path details listing if mapped */}
            {routesData && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Available Transport Modes
                </span>
                
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {routesData.options.map((opt, i) => {
                    const isSelected = selectedRouteOption?.mode === opt.mode;
                    let emoji = "🚶";
                    if (opt.mode === "bicycle") emoji = "🚴";
                    if (opt.mode === "bus") emoji = "🚌";
                    if (opt.mode === "metro") emoji = "🚇";
                    if (opt.mode === "train") emoji = "🚆";
                    if (opt.mode === "auto") emoji = "🛺";
                    if (opt.mode === "taxi" || opt.mode === "ride_sharing") emoji = "🚕";
                    
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedRouteOption(opt)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? 'bg-brand-teal/15 border-brand-teal/60 shadow-glass'
                            : 'bg-darkBg-card/30 border-darkBg-border/40 hover:border-brand-teal/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold text-slate-200 capitalize">{opt.mode.replace('_', ' ')}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">{opt.distance_km} km</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-xs font-black text-brand-neonCyan">{opt.duration_mins} mins</span>
                          <span className="text-[9px] text-emerald-400 font-bold mt-0.5">
                            {opt.cost === 0.0 ? "FREE" : `₹${opt.cost}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {routesData.metro_available === false && (
                  <div className="mt-2.5 p-3 rounded-xl border border-brand-red/35 bg-brand-red/5 flex items-start gap-2.5">
                    <span className="text-brand-red text-xs leading-none mt-0.5">⚠️</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-brand-red uppercase tracking-wider leading-none">Metro Unavailable</span>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        {routesData.metro_status_message || "Metro service is not available for this route."}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRouteOption && selectedRouteOption.mode === "metro" && (
                  <div className="mt-3 p-3.5 rounded-xl border border-brand-teal/40 bg-brand-teal/5 flex flex-col gap-2.5 shadow-glass animate-fade-in text-[10px] text-slate-300">
                    <div className="flex justify-between items-center border-b border-darkBg-border pb-2">
                      <span className="text-xs font-black text-brand-neonCyan uppercase tracking-wider flex items-center gap-1.5">
                        🚇 Hyderabad Metro Route
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-darkBg-deep/50 p-2 rounded-lg border border-darkBg-border/30">
                        <span className="text-slate-400 block font-semibold text-[8px] uppercase">FROM</span>
                        <b className="text-white text-xs">{selectedRouteOption.instructions[0].replace('Source Station: ', '').replace('Source location is not a metro station. Nearest station selected: ', '')}</b>
                      </div>
                      <div className="bg-darkBg-deep/50 p-2 rounded-lg border border-darkBg-border/30">
                        <span className="text-slate-400 block font-semibold text-[8px] uppercase">TO</span>
                        <b className="text-white text-xs">{selectedRouteOption.instructions[1].replace('Destination Station: ', '').replace('Destination location is not a metro station. Nearest station selected: ', '')}</b>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between py-1 border-b border-darkBg-border/40">
                        <span>Line(s) Used:</span>
                        <span className="font-bold text-slate-100">{selectedRouteOption.instructions[2].replace('Line(s) used: ', '')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-darkBg-border/40">
                        <span>Interchanges:</span>
                        <span className="font-bold text-brand-neonCyan">{selectedRouteOption.instructions[3].replace('Interchange Station(s): ', '')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-darkBg-border/40">
                        <span>Total Hops:</span>
                        <span className="font-bold text-slate-100">{selectedRouteOption.instructions[4].replace('Total Hops: ', '')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-darkBg-border/40">
                        <span>Travel Time:</span>
                        <span className="font-bold text-emerald-400">{selectedRouteOption.instructions[5].replace('Estimated Duration: ', '')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Route Path Order:</span>
                      <div className="bg-darkBg-deep/60 border border-darkBg-border/40 rounded-xl p-2.5 max-h-[140px] overflow-y-auto flex flex-col gap-1 pr-1.5">
                        {selectedRouteOption.instructions.slice(7).map((step, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center text-[10px] text-slate-200">
                            <span className="text-brand-teal font-extrabold">{step.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Context panel for tabs with no forms (quick advice) */}
        {activeTab !== "routes" && (
          <div className="bg-darkBg-deep/40 border border-darkBg-border p-3.5 rounded-xl flex flex-col gap-2.5 mt-2">
            <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse text-brand-neonCyan" /> Smart Mobility Index
            </span>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Your commute calculations are updated using live machine learning algorithms. Swap options inside panels to evaluate different routes.
            </p>
          </div>
        )}
      </div>

      {/* 3. Footer / Auth User Profile Panel */}
      <div className="p-4 border-t border-darkBg-border flex flex-col gap-3">
        {currentUser ? (
          <div className="flex items-center justify-between bg-darkBg-card/50 border border-darkBg-border p-3 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center text-brand-neonCyan font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
                <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                  {currentUser.sustainability_points} XP
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={onOpenChat}
                title="AI Travel Assistant Chat"
                className="bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-neonCyan border border-brand-teal/40 py-2 rounded-xl cursor-pointer transition-all duration-200 w-full flex justify-center items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">AI Assistant</span>
              </button>
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 text-center font-medium">UrbanFlow Secure Session Node</span>
        )}
      </div>
    </div>
  );
}
