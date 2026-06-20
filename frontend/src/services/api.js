const BACKEND_URL = import.meta.env.VITE_API_URL || `http://127.0.0.1:8000`;
const BASE_URL = `${BACKEND_URL}/api`;
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const httpErr = new Error(errorData.detail || "Request failed");
      httpErr.status = response.status;
      throw httpErr;
    }
    return await response.json();
  } catch (err) {
    console.error(`[API Client] Error on endpoint ${endpoint}:`, err);
    if (err.status) {
      throw err;
    }
    if (err.name === "TypeError" || err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
      const connErr = new Error("Unable to connect to the backend server. Please verify that the FastAPI server is running (python run.py) on http://localhost:8000.");
      connErr.isNetworkError = true;
      throw connErr;
    }
    throw err;
  }
}

export const api = {
  // Auth API
  register: (name, email, password, phone = null) => {
    console.log("[API Client] Registering user:", email);
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    });
  },
  
  login: async (email, password) => {
    console.log("[API Client] Sending login request to backend for:", email);
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
      
      console.log("[API Client] HTTP response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[API Client] HTTP login error details:", errorData);
        const httpErr = new Error(errorData.detail || "Login failed");
        httpErr.status = response.status;
        throw httpErr;
      }
      
      const data = await response.json();
      console.log("[API Client] Login token received successfully.");
      localStorage.setItem("token", data.access_token);
      return data;
    } catch (err) {
      console.error("[API Client] Fetch or network error during login:", err);
      if (err.status) {
        throw err;
      }
      if (err.name === "TypeError" || err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
        const connErr = new Error("Unable to connect to the backend server. Please verify that the FastAPI server is running (python run.py) on http://localhost:8000.");
        connErr.isNetworkError = true;
        throw connErr;
      }
      throw err;
    }
  },
  
  getCurrentUser: () => {
    return request("/auth/me");
  },
  
  updateContacts: (contacts) => {
    return request("/auth/contacts", {
      method: "PUT",
      body: JSON.stringify({ contacts }),
    });
  },
  
  // Route planning API
  planRoute: (startLat, startLng, endLat, endLng, preference) => {
    return request("/routes/plan", {
      method: "POST",
      body: JSON.stringify({
        start_lat: startLat,
        start_lng: startLng,
        end_lat: endLat,
        end_lng: endLng,
        preference
      }),
    });
  },
  
  // Traffic predict API
  getCongestion: (lat, lng) => {
    return request(`/traffic/congestion?lat=${lat}&lng=${lng}`);
  },
  
  getTrafficForecast: (lat, lng) => {
    return request(`/traffic/forecast?lat=${lat}&lng=${lng}`);
  },
  
  // Safety API
  getSafetyScore: (lat, lng) => {
    return request(`/safety/score?lat=${lat}&lng=${lng}`);
  },
  
  getSafetyHotspots: (lat, lng) => {
    return request(`/safety/hotspots?lat=${lat}&lng=${lng}`);
  },
  
  triggerSOS: (lat, lng, routeDetails = "") => {
    return request("/safety/sos", {
      method: "POST",
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        route_details: routeDetails
      }),
    });
  },
  
  // Sustainability & Carbon API
  getCarbonStats: () => {
    return request("/carbon/stats");
  },
  
  // Cost API
  getCostCompare: (distanceKm) => {
    return request(`/cost/compare?distance_km=${distanceKm}`);
  },
  
  // Live Alerts API
  getAlerts: () => {
    return request("/alerts");
  },
  
  // Chat API
  sendMessage: (message, lat = null, lng = null) => {
    return request("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        current_lat: lat,
        current_lng: lng
      }),
    });
  },
  
  // Community Reporting API
  getIncidents: () => {
    return request("/community/incidents");
  },
  
  reportIncident: (type, description, lat, lng, severity, imageUrl = null) => {
    return request("/community/report", {
      method: "POST",
      body: JSON.stringify({
        type,
        description,
        latitude: lat,
        longitude: lng,
        severity,
        image_url: imageUrl
      }),
    });
  },
  
  upvoteIncident: (incidentId) => {
    return request(`/community/upvote/${incidentId}`, {
      method: "POST"
    });
  },
  
  // Admin API
  getAdminMetrics: () => {
    return request("/admin/metrics");
  },
  getAdminUsers: () => {
    return request("/admin/users");
  }
};
export default api;
